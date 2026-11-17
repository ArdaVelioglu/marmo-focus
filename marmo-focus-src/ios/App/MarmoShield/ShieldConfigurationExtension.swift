import ManagedSettings
import ManagedSettingsUI
import UIKit

/// The screen shown over a blocked app during a focus session. Texts are written by the app in
/// the person's language (with their marmoset's name) when the session starts.
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration { marmo() }
    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration { marmo() }
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration { marmo() }
    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration { marmo() }

    private func marmo() -> ShieldConfiguration {
        let d = UserDefaults(suiteName: "group.com.ardavelioglu.marmofocus")
        let title = d?.string(forKey: "shieldTitle") ?? "Your marmoset is sleeping 💤"
        let subtitle = d?.string(forKey: "shieldSubtitle") ?? "This app is locked until your focus session ends."
        let button = d?.string(forKey: "shieldButton") ?? "OK"
        return ShieldConfiguration(
            backgroundBlurStyle: .systemThickMaterial,
            backgroundColor: nil,
            icon: UIImage(named: "ShieldIcon"),
            title: ShieldConfiguration.Label(text: title, color: .label),
            subtitle: ShieldConfiguration.Label(text: subtitle, color: .secondaryLabel),
            primaryButtonLabel: ShieldConfiguration.Label(text: button, color: .white),
            primaryButtonBackgroundColor: UIColor(red: 0.85, green: 0.47, blue: 0.29, alpha: 1),
            secondaryButtonLabel: nil
        )
    }
}
