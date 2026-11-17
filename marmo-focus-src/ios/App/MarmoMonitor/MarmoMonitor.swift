import DeviceActivity
import ManagedSettings

/// Lifts the focus-session shield when the scheduled interval ends, even if Marmo Focus is closed.
class MarmoMonitor: DeviceActivityMonitor {
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        ManagedSettingsStore(named: ManagedSettingsStore.Name("marmo")).clearAllSettings()
    }
}
