// App blocking during focus sessions, built on Apple's Screen Time API
// (FamilyControls · ManagedSettings · DeviceActivity).
//
//  · The person picks apps, categories and websites with Apple's FamilyActivityPicker. Apple only
//    hands us opaque tokens: we never learn which apps were chosen, and the selection never
//    leaves the device (it is stored in the shared App Group so the extensions can read it).
//  · start(endsAt) shields the selection and schedules a DeviceActivity interval that ends at the
//    session end. The MarmoMonitor extension clears the shield when the interval ends, so apps
//    unlock on time even if Marmo Focus is closed.
//  · The MarmoShield extension draws the "your marmoset is sleeping" screen over blocked apps.
import Foundation
import Capacitor
import SwiftUI
import FamilyControls
import ManagedSettings
import DeviceActivity

enum MarmoShared {
    static let group = "group.com.ardavelioglu.marmofocus"
    static let selectionKey = "blockSelection"
    static let titleKey = "shieldTitle"
    static let subtitleKey = "shieldSubtitle"
    static let buttonKey = "shieldButton"
    static var defaults: UserDefaults? { UserDefaults(suiteName: group) }
}

extension ManagedSettingsStore.Name {
    static let marmo = Self("marmo")
}

extension DeviceActivityName {
    static let marmoSession = Self("marmoSession")
}

enum BlockSelection {
    static func load() -> FamilyActivitySelection? {
        guard let data = MarmoShared.defaults?.data(forKey: MarmoShared.selectionKey) else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    }

    static func save(_ selection: FamilyActivitySelection) {
        guard let data = try? JSONEncoder().encode(selection) else { return }
        MarmoShared.defaults?.set(data, forKey: MarmoShared.selectionKey)
    }

    static func count(_ selection: FamilyActivitySelection?) -> Int {
        guard let s = selection else { return 0 }
        return s.applicationTokens.count + s.categoryTokens.count + s.webDomainTokens.count
    }

    static func shield(_ s: FamilyActivitySelection) {
        let store = ManagedSettingsStore(named: .marmo)
        store.shield.applications = s.applicationTokens.isEmpty ? nil : s.applicationTokens
        store.shield.applicationCategories = s.categoryTokens.isEmpty ? nil : .specific(s.categoryTokens)
        store.shield.webDomains = s.webDomainTokens.isEmpty ? nil : s.webDomainTokens
        store.shield.webDomainCategories = s.categoryTokens.isEmpty ? nil : .specific(s.categoryTokens)
    }

    static func unshield() {
        ManagedSettingsStore(named: .marmo).clearAllSettings()
    }
}

@objc(AppBlockPlugin)
public class AppBlockPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppBlockPlugin"
    public let jsName = "AppBlock"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pickApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
    ]

    private func authorization() -> String {
        switch AuthorizationCenter.shared.authorizationStatus {
        case .approved: return "approved"
        case .denied: return "denied"
        default: return "notDetermined"
        }
    }

    @objc func status(_ call: CAPPluginCall) {
        call.resolve(["supported": true, "authorization": authorization(), "count": BlockSelection.count(BlockSelection.load())])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            } catch {
                // Declined, or Screen Time is restricted on this device.
            }
            call.resolve(["authorization": self.authorization()])
        }
    }

    @objc func pickApps(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController else {
                call.reject("No view controller")
                return
            }
            var host: UIViewController?
            let picker = AppPickerView(
                selection: BlockSelection.load() ?? FamilyActivitySelection(),
                title: call.getString("title") ?? "Block Apps",
                done: call.getString("done") ?? "Done",
                cancel: call.getString("cancel") ?? "Cancel"
            ) { result in
                if let result = result { BlockSelection.save(result) }
                host?.dismiss(animated: true)
                call.resolve(["saved": result != nil, "count": BlockSelection.count(BlockSelection.load())])
            }
            let controller = UIHostingController(rootView: picker)
            controller.isModalInPresentation = true   // closes only through Done / Cancel, so the call always resolves
            host = controller
            presenter.present(controller, animated: true)
        }
    }

    /// endsAt: device-clock milliseconds since 1970. title / subtitle / button: shield texts in the app's language.
    @objc func start(_ call: CAPPluginCall) {
        guard let endsAt = call.getDouble("endsAt") else {
            call.reject("endsAt is required")
            return
        }
        let end = Date(timeIntervalSince1970: endsAt / 1000)
        guard AuthorizationCenter.shared.authorizationStatus == .approved,
              let selection = BlockSelection.load(), BlockSelection.count(selection) > 0,
              end > Date() else {
            call.resolve(["active": false])
            return
        }

        let defaults = MarmoShared.defaults
        defaults?.set(call.getString("title"), forKey: MarmoShared.titleKey)
        defaults?.set(call.getString("subtitle"), forKey: MarmoShared.subtitleKey)
        defaults?.set(call.getString("button"), forKey: MarmoShared.buttonKey)

        BlockSelection.shield(selection)

        // DeviceActivity needs an interval of at least 15 minutes, so a short remainder (e.g. after
        // reopening the app late in a session) starts the interval in the past; only its end matters.
        let center = DeviceActivityCenter()
        center.stopMonitoring([.marmoSession])
        let start = min(Date(), end.addingTimeInterval(-16 * 60))
        let parts: Set<Calendar.Component> = [.year, .month, .day, .hour, .minute, .second]
        let schedule = DeviceActivitySchedule(
            intervalStart: Calendar.current.dateComponents(parts, from: start),
            intervalEnd: Calendar.current.dateComponents(parts, from: end),
            repeats: false
        )
        do {
            try center.startMonitoring(.marmoSession, during: schedule)
        } catch {
            // The shield stays on; the app lifts it when the session ends or on the next launch.
        }
        call.resolve(["active": true])
    }

    @objc func stop(_ call: CAPPluginCall) {
        DeviceActivityCenter().stopMonitoring([.marmoSession])
        BlockSelection.unshield()
        call.resolve()
    }
}

struct AppPickerView: View {
    @State var selection: FamilyActivitySelection
    let title: String
    let done: String
    let cancel: String
    let onFinish: (FamilyActivitySelection?) -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button(cancel) { onFinish(nil) }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button(done) { onFinish(selection) }.font(.headline)
                    }
                }
        }
        .navigationViewStyle(.stack)
    }
}
