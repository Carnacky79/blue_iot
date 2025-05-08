<!-- client/src/views/SettingsView.vue -->
<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>Settings</h1>
      <div class="header-actions">
        <ui-button
            variant="primary"
            icon="fas fa-save"
            :loading="saving"
            @click="saveSettings"
        >
          Save Settings
        </ui-button>
      </div>
    </div>

    <ui-alert v-if="successMessage" type="success" :autoDismiss="5000" @dismissed="successMessage = ''">
      {{ successMessage }}
    </ui-alert>

    <ui-alert v-if="error" type="danger" dismissible @dismissed="error = ''">
      {{ error }}
    </ui-alert>

    <div class="settings-container">
      <div class="settings-sidebar">
        <div class="settings-nav">
          <button
              v-for="section in settingsSections"
              :key="section.id"
              class="nav-item"
              :class="{ active: activeSection === section.id }"
              @click="activeSection = section.id"
          >
            <i :class="section.icon"></i>
            <span>{{ section.label }}</span>
          </button>
        </div>
      </div>

      <div class="settings-content">
        <!-- Account Settings -->
        <div v-if="activeSection === 'account'" class="settings-section">
          <h2>Account Settings</h2>

          <div class="settings-card">
            <h3>Profile Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                    type="text"
                    id="firstName"
                    v-model="settings.account.firstName"
                    placeholder="Enter your first name"
                />
              </div>

              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    v-model="settings.account.lastName"
                    placeholder="Enter your last name"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                  type="email"
                  id="email"
                  v-model="settings.account.email"
                  placeholder="Enter your email address"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                  type="tel"
                  id="phone"
                  v-model="settings.account.phone"
                  placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div class="settings-card">
            <h3>Change Password</h3>
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                  type="password"
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  placeholder="Enter your current password"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input
                    type="password"
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    placeholder="Enter new password"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    placeholder="Confirm new password"
                />
              </div>
            </div>

            <div class="password-requirements">
              <p>Password must:</p>
              <ul>
                <li :class="{ valid: passwordStrength.length }">Be at least 8 characters long</li>
                <li :class="{ valid: passwordStrength.uppercase }">Include at least one uppercase letter</li>
                <li :class="{ valid: passwordStrength.lowercase }">Include at least one lowercase letter</li>
                <li :class="{ valid: passwordStrength.number }">Include at least one number</li>
                <li :class="{ valid: passwordStrength.special }">Include at least one special character</li>
              </ul>
            </div>

            <div class="form-actions">
              <ui-button
                  variant="primary"
                  :disabled="!canChangePassword"
                  @click="changePassword"
              >
                Change Password
              </ui-button>
            </div>
          </div>
        </div>

        <!-- Display Settings -->
        <div v-if="activeSection === 'display'" class="settings-section">
          <h2>Display Settings</h2>

          <div class="settings-card">
            <h3>Theme & Layout</h3>

            <div class="form-group">
              <label>Theme</label>
              <div class="theme-options">
                <div
                    class="theme-option"
                    :class="{ active: settings.display.theme === 'light' }"
                    @click="settings.display.theme = 'light'"
                >
                  <div class="theme-preview light"></div>
                  <span>Light</span>
                </div>

                <div
                    class="theme-option"
                    :class="{ active: settings.display.theme === 'dark' }"
                    @click="settings.display.theme = 'dark'"
                >
                  <div class="theme-preview dark"></div>
                  <span>Dark</span>
                </div>

                <div
                    class="theme-option"
                    :class="{ active: settings.display.theme === 'system' }"
                    @click="settings.display.theme = 'system'"
                >
                  <div class="theme-preview system"></div>
                  <span>System</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Sidebar Position</label>
              <div class="radio-options">
                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="settings.display.sidebarPosition"
                      value="left"
                  />
                  <span>Left</span>
                </label>

                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="settings.display.sidebarPosition"
                      value="right"
                  />
                  <span>Right</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Default Map View</label>
              <select v-model="settings.display.defaultMapView">
                <option value="satellite">Satellite</option>
                <option value="blueprint">Blueprint</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div class="settings-card">
            <h3>Maps & Location</h3>

            <div class="form-group">
              <label>Distance Unit</label>
              <div class="radio-options">
                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="settings.display.distanceUnit"
                      value="meters"
                  />
                  <span>Meters</span>
                </label>

                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="settings.display.distanceUnit"
                      value="feet"
                  />
                  <span>Feet</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Time Format</label>
              <div class="radio-options">
                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="settings.display.timeFormat"
                      value="12h"
                  />
                  <span>12-hour (AM/PM)</span>
                </label>

                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="settings.display.timeFormat"
                      value="24h"
                  />
                  <span>24-hour</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="settings.display.showCoordinates"
                />
                <span>Show coordinates on map</span>
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="settings.display.showGrid"
                />
                <span>Show grid on map</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div v-if="activeSection === 'notifications'" class="settings-section">
          <h2>Notification Settings</h2>

          <div class="settings-card">
            <h3>In-App Notifications</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="settings.notifications.showInApp"
                />
                <span>Show in-app notifications</span>
              </label>
            </div>

            <div class="form-group" v-if="settings.notifications.showInApp">
              <label>Notification Sound</label>
              <div class="sound-options">
                <div
                    v-for="sound in notificationSounds"
                    :key="sound.id"
                    class="sound-option"
                    :class="{ active: settings.notifications.sound === sound.id }"
                    @click="selectNotificationSound(sound.id)"
                >
                  <i class="fas fa-volume-up"></i>
                  <span>{{ sound.name }}</span>
                  <button class="play-button" @click.stop="playSound(sound.id)">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3>Email Notifications</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="settings.notifications.emailAlerts"
                />
                <span>Receive critical alerts via email</span>
              </label>
            </div>

            <div class="form-group" v-if="settings.notifications.emailAlerts">
              <label>Email frequency</label>
              <select v-model="settings.notifications.emailFrequency">
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly digest</option>
                <option value="daily">Daily digest</option>
              </select>
            </div>
          </div>

          <div class="settings-card">
            <h3>Alert Types</h3>
            <p class="card-description">Select which types of alerts you want to receive:</p>

            <div class="notification-types">
              <div
                  v-for="alert in alertTypes"
                  :key="alert.id"
                  class="notification-type"
              >
                <div class="notification-type-header">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="settings.notifications.alertTypes[alert.id]"
                    />
                    <span>{{ alert.name }}</span>
                  </label>
                </div>
                <p class="notification-description">{{ alert.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Integration Settings -->
        <div v-if="activeSection === 'integrations'" class="settings-section">
          <h2>Integration Settings</h2>

          <div class="settings-card">
            <h3>BlueIOT Configuration</h3>

            <div class="form-group">
              <label for="blueiotServer">BlueIOT Server URL</label>
              <input
                  type="text"
                  id="blueiotServer"
                  v-model="settings.integrations.blueiot.serverUrl"
                  placeholder="Enter server URL"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="blueiotUsername">Username</label>
                <input
                    type="text"
                    id="blueiotUsername"
                    v-model="settings.integrations.blueiot.username"
                    placeholder="Enter username"
                />
              </div>

              <div class="form-group">
                <label for="blueiotPassword">Password</label>
                <input
                    type="password"
                    id="blueiotPassword"
                    v-model="settings.integrations.blueiot.password"
                    placeholder="Enter password"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="blueiotUpdateInterval">Update Interval (seconds)</label>
              <input
                  type="number"
                  id="blueiotUpdateInterval"
                  v-model.number="settings.integrations.blueiot.updateInterval"
                  min="1"
                  max="60"
              />
            </div>

            <div class="form-actions">
              <ui-button
                  variant="secondary"
                  icon="fas fa-sync-alt"
                  @click="testBlueIOTConnection"
                  :loading="testingBlueIOT"
              >
                Test Connection
              </ui-button>
            </div>
          </div>

          <div class="settings-card">
            <h3>CRM Integration</h3>

            <div class="form-group">
              <label for="crmApiUrl">CRM API URL</label>
              <input
                  type="text"
                  id="crmApiUrl"
                  v-model="settings.integrations.crm.apiUrl"
                  placeholder="Enter API URL"
              />
            </div>

            <div class="form-group">
              <label for="crmApiKey">API Key</label>
              <div class="api-key-input">
                <input
                    :type="showApiKey ? 'text' : 'password'"
                    id="crmApiKey"
                    v-model="settings.integrations.crm.apiKey"
                    placeholder="Enter API key"
                />
                <button class="toggle-visibility" @click="showApiKey = !showApiKey">
                  <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="settings.integrations.crm.syncEnabled"
                />
                <span>Enable automatic synchronization</span>
              </label>
            </div>

            <div class="form-group" v-if="settings.integrations.crm.syncEnabled">
              <label>Sync Frequency</label>
              <select v-model="settings.integrations.crm.syncFrequency">
                <option value="15m">Every 15 minutes</option>
                <option value="30m">Every 30 minutes</option>
                <option value="1h">Every hour</option>
                <option value="6h">Every 6 hours</option>
                <option value="24h">Daily</option>
              </select>
            </div>

            <div class="form-actions">
              <ui-button
                  variant="secondary"
                  icon="fas fa-sync-alt"
                  @click="testCRMConnection"
                  :loading="testingCRM"
              >
                Test Connection
              </ui-button>

              <ui-button
                  variant="primary"
                  icon="fas fa-sync"
                  @click="syncWithCRM"
                  :loading="syncingCRM"
              >
                Sync Now
              </ui-button>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div v-if="activeSection === 'system'" class="settings-section">
          <h2>System Settings</h2>

          <div class="settings-card">
            <h3>Data Management</h3>

            <div class="form-group">
              <label>Data Retention Period</label>
              <select v-model="settings.system.dataRetentionPeriod">
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
                <option value="forever">Forever</option>
              </select>
            </div>

            <div class="form-actions spaced">
              <ui-button
                  variant="secondary"
                  icon="fas fa-download"
                  @click="exportSystemData"
              >
                Export All Data
              </ui-button>

              <ui-button
                  variant="danger"
                  icon="fas fa-trash-alt"
                  @click="showDeleteDataConfirm = true"
              >
                Delete All Data
              </ui-button>
            </div>
          </div>

          <div class="settings-card">
            <h3>Logging & Debugging</h3>

            <div class="form-group">
              <label>Log Level</label>
              <select v-model="settings.system.logLevel">
                <option value="error">Error only</option>
                <option value="warn">Warning and errors</option>
                <option value="info">Information</option>
                <option value="debug">Debug (verbose)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="settings.system.enableAnalytics"
                />
                <span>Enable analytics to help improve the application</span>
              </label>
            </div>

            <div class="form-actions">
              <ui-button
                  variant="secondary"
                  icon="fas fa-file-alt"
                  @click="viewLogs"
              >
                View Logs
              </ui-button>
            </div>
          </div>

          <div class="settings-card">
            <h3>System Information</h3>

            <div class="system-info">
              <div class="info-item">
                <div class="info-label">Version</div>
                <div class="info-value">{{ systemInfo.version }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">Server Status</div>
                <div class="info-value">
                  <span :class="systemInfo.serverStatus === 'online' ? 'status-online' : 'status-offline'">
                    {{ systemInfo.serverStatus }}
                  </span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">Last Sync</div>
                <div class="info-value">{{ systemInfo.lastSync }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">Database Size</div>
                <div class="info-value">{{ systemInfo.databaseSize }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Data Confirmation Modal -->
    <div v-if="showDeleteDataConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Delete All Data</h2>
          <button class="modal-close" @click="showDeleteDataConfirm = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <ui-alert type="danger">
            <strong>Warning!</strong> This action cannot be undone. All your data will be permanently deleted.
          </ui-alert>

          <p>Please type <strong>DELETE</strong> to confirm:</p>

          <div class="form-group">
            <input
                type="text"
                v-model="deleteConfirmText"
                placeholder="Type DELETE to confirm"
            />
          </div>
        </div>

        <div class="modal-footer">
          <ui-button variant="light" @click="showDeleteDataConfirm = false">
            Cancel
          </ui-button>

          <ui-button
              variant="danger"
              :disabled="deleteConfirmText !== 'DELETE'"
              @click="deleteAllData"
          >
            Delete All Data
          </ui-button>
        </div>
      </div>
    </div>

    <!-- Logs Modal -->
    <div v-if="showLogsModal" class="modal-overlay">
      <div class="modal-container logs-modal">
        <div class="modal-header">
          <h2>System Logs</h2>
          <button class="modal-close" @click="showLogsModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="logs-filter">
            <div class="form-group">
              <label>Filter by:</label>
              <select v-model="logsFilter">
                <option value="all">All logs</option>
                <option value="error">Errors only</option>
                <option value="warn">Warnings and errors</option>
                <option value="info">Info and above</option>
              </select>
            </div>

            <div class="form-group">
              <label>Date range:</label>
              <select v-model="logsDateRange">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>

            <ui-button
                variant="secondary"
                size="sm"
                icon="fas fa-sync-alt"
                @click="refreshLogs"
            >
              Refresh
            </ui-button>
          </div>

          <div class="logs-container">
            <div
                v-for="(log, index) in filteredLogs"
                :key="index"
                class="log-entry"
                :class="log.level"
            >
              <div class="log-time">{{ formatLogTime(log.timestamp) }}</div>
              <div class="log-level">{{ log.level.toUpperCase() }}</div>
              <div class="log-message">{{ log.message }}</div>
            </div>

            <div v-if="filteredLogs.length === 0" class="no-logs">
              No logs found matching the current filters.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <ui-button
              variant="secondary"
              icon="fas fa-download"
              @click="downloadLogs"
          >
            Download Logs
          </ui-button>

          <ui-button variant="light" @click="showLogsModal = false">
            Close
          </ui-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import UiButton from '../components/common/ui/Button.vue';
import UiAlert from '../components/common/ui/Alert.vue';

// Stores
const authStore = useAuthStore();

// State
const activeSection = ref('account');
const saving = ref(false);
const error = ref('');
const successMessage = ref('');
const showApiKey = ref(false);
const showDeleteDataConfirm = ref(false);
const deleteConfirmText = ref('');
const showLogsModal = ref(false);
const testingBlueIOT = ref(false);
const testingCRM = ref(false);
const syncingCRM = ref(false);
const logsFilter = ref('all');
const logsDateRange = ref('today');

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Settings sections
const settingsSections = [
  { id: 'account', label: 'Account', icon: 'fas fa-user-circle' },
  { id: 'display', label: 'Display', icon: 'fas fa-desktop' },
  { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
  { id: 'integrations', label: 'Integrations', icon: 'fas fa-plug' },
  { id: 'system', label: 'System', icon: 'fas fa-cogs' }
];

// Settings model
const settings = reactive({
  account: {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  },
  display: {
    theme: 'light',
    sidebarPosition: 'left',
    defaultMapView: 'blueprint',
    distanceUnit: 'meters',
    timeFormat: '24h',
    showCoordinates: true,
    showGrid: true
  },
  notifications: {
    showInApp: true,
    sound: 'default',
    emailAlerts: false,
    emailFrequency: 'immediate',
    alertTypes: {
      geofence: true,
      emergency: true,
      battery: true,
      connection: true,
      system: true
    }
  },
  integrations: {
    blueiot: {
      serverUrl: 'wss://blueiot.example.com/ws',
      username: '',
      password: '',
      updateInterval: 5
    },
    crm: {
      apiUrl: 'https://crm.example.com/api',
      apiKey: '',
      syncEnabled: false,
      syncFrequency: '1h'
    }
  },
  system: {
    dataRetentionPeriod: '90',
    logLevel: 'info',
    enableAnalytics: true
  }
});

// System info
const systemInfo = reactive({
  version: '1.0.0',
  serverStatus: 'online',
  lastSync: '2023-08-15 14:30:45',
  databaseSize: '245 MB'
});

// Notification sounds
const notificationSounds = [
  { id: 'default', name: 'Default', file: 'default.mp3' },
  { id: 'alert', name: 'Alert', file: 'alert.mp3' },
  { id: 'bell', name: 'Bell', file: 'bell.mp3' },
  { id: 'chime', name: 'Chime', file: 'chime.mp3' },
  { id: 'none', name: 'None', file: '' }
];

// Alert types
const alertTypes = [
  {
    id: 'geofence',
    name: 'Geofence Violations',
    description: 'Alerts when an employee or asset enters or exits a defined geofence area.'
  },
  {
    id: 'emergency',
    name: 'Emergency Alerts',
    description: 'Critical alerts triggered by emergency buttons or panic situations.'
  },
  {
    id: 'battery',
    name: 'Low Battery',
    description: 'Notifications when a device battery level falls below a set threshold.'
  },
  {
    id: 'connection',
    name: 'Connection Issues',
    description: 'Alerts when devices lose connection or experience communication problems.'
  },
  {
    id: 'system',
    name: 'System Alerts',
    description: 'Notifications about system updates, maintenance, or issues.'
  }
];

// Mocked logs
const logs = ref([
  {
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    level: 'info',
    message: 'User login successful - admin@example.com'
  },
  {
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    level: 'warn',
    message: 'BlueIOT connection unstable - reconnection attempts: 3'
  },
  {
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    level: 'error',
    message: 'CRM API connection failed - timeout after 30s'
  },
  {
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    level: 'info',
    message: 'Data sync completed - 156 records processed'
  },
  {
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    level: 'debug',
    message: 'Map rendering performance: 45fps avg on client device'
  }
]);

// Computed
const passwordStrength = computed(() => {
  const password = passwordForm.newPassword;
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
});

const canChangePassword = computed(() => {
  return (
      !!passwordForm.currentPassword &&
      !!passwordForm.newPassword &&
      passwordForm.newPassword === passwordForm.confirmPassword &&
      passwordStrength.value.length &&
      passwordStrength.value.uppercase &&
      passwordStrength.value.lowercase &&
      passwordStrength.value.number &&
      passwordStrength.value.special
  );
});

const filteredLogs = computed(() => {
  let result = [...logs.value];

  // Filter by level
  if (logsFilter.value !== 'all') {
    const levels = {
      error: ['error'],
      warn: ['error', 'warn'],
      info: ['error', 'warn', 'info']
    };

    const allowedLevels = levels[logsFilter.value as keyof typeof levels] || [];
    result = result.filter(log => allowedLevels.includes(log.level));
  }

  // Filter by date range
  const now = new Date();
  let startDate: Date;

  switch (logsDateRange.value) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      startDate = new Date(0); // Beginning of time
  }

  result = result.filter(log => new Date(log.timestamp) >= startDate);

  // Sort by timestamp (newest first)
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return result;
});

// Methods
function loadUserSettings() {
  // In a real app, this would fetch settings from an API or local storage
  if (authStore.user) {
    settings.account.firstName = authStore.user.firstName;
    settings.account.lastName = authStore.user.lastName;
    settings.account.email = authStore.user.email;

    // Load other settings from local storage or default values
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        Object.assign(settings.display, parsedSettings.display || {});
        Object.assign(settings.notifications, parsedSettings.notifications || {});
        Object.assign(settings.integrations, parsedSettings.integrations || {});
        Object.assign(settings.system, parsedSettings.system || {});
      } catch (err) {
        console.error('Error parsing saved settings:', err);
      }
    }
  }
}

async function saveSettings() {
  try {
    saving.value = true;
    error.value = '';

    // In a real app, this would update settings via an API
    // For demo, we'll just save to localStorage and simulate an API call

    // Update account info if changed
    if (authStore.user) {
      if (
          authStore.user.firstName !== settings.account.firstName ||
          authStore.user.lastName !== settings.account.lastName ||
          authStore.user.email !== settings.account.email
      ) {
        const userData = {
          firstName: settings.account.firstName,
          lastName: settings.account.lastName,
          email: settings.account.email
        };

        // Update user info in store
        authStore.updateUser(userData);
      }
    }

    // Save other settings to localStorage
    const settingsToSave = {
      display: settings.display,
      notifications: settings.notifications,
      integrations: settings.integrations,
      system: settings.system
    };

    localStorage.setItem('user_settings', JSON.stringify(settingsToSave));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Apply theme immediately if changed
    document.documentElement.setAttribute('data-theme', settings.display.theme);

    successMessage.value = 'Settings saved successfully';
  } catch (err: any) {
    console.error('Error saving settings:', err);
    error.value = err.message || 'Failed to save settings';
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  if (!canChangePassword.value) return;

  try {
    saving.value = true;
    error.value = '';

    // In a real app, this would call an API to change password
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    successMessage.value = 'Password changed successfully';
  } catch (err: any) {
    console.error('Error changing password:', err);
    error.value = err.message || 'Failed to change password';
  } finally {
    saving.value = false;
  }
}

function selectNotificationSound(soundId: string) {
  settings.notifications.sound = soundId;
}

function playSound(soundId: string) {
  const sound = notificationSounds.find(s => s.id === soundId);
  if (!sound || sound.id === 'none') return;

  // In a real app, this would play an actual sound file
  console.log(`Playing sound: ${sound.file}`);
}

async function testBlueIOTConnection() {
  try {
    testingBlueIOT.value = true;
    error.value = '';

    // In a real app, this would test the connection to BlueIOT
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.3; // 70% chance of success

    if (success) {
      successMessage.value = 'BlueIOT connection successful';
    } else {
      throw new Error('Failed to connect to BlueIOT server');
    }
  } catch (err: any) {
    console.error('BlueIOT connection test error:', err);
    error.value = err.message;
  } finally {
    testingBlueIOT.value = false;
  }
}

async function testCRMConnection() {
  try {
    testingCRM.value = true;
    error.value = '';

    // In a real app, this would test the connection to the CRM
    await new Promise(resolve => setTimeout(resolve, 1200));

    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      successMessage.value = 'CRM connection successful';
    } else {
      throw new Error('Failed to connect to CRM API');
    }
  } catch (err: any) {
    console.error('CRM connection test error:', err);
    error.value = err.message;
  } finally {
    testingCRM.value = false;
  }
}

async function syncWithCRM() {
  try {
    syncingCRM.value = true;
    error.value = '';

    // In a real app, this would sync data with the CRM
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update last sync time
    systemInfo.lastSync = new Date().toLocaleString();

    successMessage.value = 'Synced with CRM successfully';
  } catch (err: any) {
    console.error('CRM sync error:', err);
    error.value = err.message || 'Failed to sync with CRM';
  } finally {
    syncingCRM.value = false;
  }
}

function exportSystemData() {
  // In a real app, this would export all system data
  // For now, we'll just show a message
  successMessage.value = 'System data export started. You will be notified when the export is ready.';
}

async function deleteAllData() {
  if (deleteConfirmText.value !== 'DELETE') return;

  try {
    saving.value = true;

    // In a real app, this would delete all data
    await new Promise(resolve => setTimeout(resolve, 2000));

    successMessage.value = 'All data has been deleted successfully';
    showDeleteDataConfirm.value = false;
    deleteConfirmText.value = '';
  } catch (err: any) {
    console.error('Error deleting data:', err);
    error.value = err.message || 'Failed to delete data';
  } finally {
    saving.value = false;
  }
}

function viewLogs() {
  showLogsModal.value = true;
  refreshLogs();
}

function refreshLogs() {
  // In a real app, this would fetch logs from an API
  // For now, we'll just use the mocked logs
}

function formatLogTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

function downloadLogs() {
  const logsData = filteredLogs.value.map(log =>
      `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`
  ).join('\n');

  const blob = new Blob([logsData], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'system_logs.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Lifecycle
onMounted(() => {
  loadUserSettings();
});
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.settings-container {
  display: flex;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-sidebar {
  width: 220px;
  background-color: #f5f5f5;
  border-right: 1px solid var(--border-color);
}

.settings-nav {
  padding: 15px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  color: var(--text-color);
}

.nav-item i {
  width: 20px;
  margin-right: 10px;
}

.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.nav-item.active {
  background-color: rgba(52, 152, 219, 0.08);
  color: var(--primary-color);
  font-weight: 500;
  border-left: 3px solid var(--primary-color);
}

.settings-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
}

.settings-section h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.settings-card {
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.settings-card:last-child {
  margin-bottom: 0;
}

.settings-card h3 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.card-description {
  margin: 0 0 15px;
  color: var(--light-text);
  font-size: 14px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="tel"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.form-actions.spaced {
  justify-content: space-between;
}

.radio-options {
  display: flex;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-option input {
  margin-right: 8px;
}

.password-requirements {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
}

.password-requirements p {
  margin: 0 0 8px;
  font-weight: 500;
}

.password-requirements ul {
  margin: 0;
  padding-left: 20px;
}

.password-requirements li {
  margin-bottom: 4px;
  color: var(--light-text);
}

.password-requirements li.valid {
  color: var(--secondary-color);
}

.theme-options {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.theme-option:hover {
  background-color: #f5f5f5;
}

.theme-option.active {
  background-color: rgba(52, 152, 219, 0.08);
  border: 1px solid var(--primary-color);
}

.theme-preview {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
}

.theme-preview.light {
  background-color: #ffffff;
}

.theme-preview.dark {
  background-color: #2c3e50;
}

.theme-preview.system {
  background: linear-gradient(135deg, #ffffff 50%, #2c3e50 50%);
}

.sound-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.sound-option {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.sound-option:hover {
  background-color: #f5f5f5;
}

.sound-option.active {
  border-color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.05);
}

.sound-option i {
  margin-right: 8px;
  color: var(--light-text);
}

.sound-option span {
  flex: 1;
}

.play-button {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.play-button:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.notification-types {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-type {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 12px;
}

.notification-type-header {
  margin-bottom: 8px;
}

.notification-description {
  margin: 0;
  font-size: 13px;
  color: var(--light-text);
  padding-left: 24px;
}

.api-key-input {
  position: relative;
}

.api-key-input input {
  padding-right: 40px;
}

.toggle-visibility {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  width: 120px;
  font-weight: 500;
  color: var(--light-text);
}

.info-value {
  flex: 1;
}

.status-online {
  color: var(--secondary-color);
}

.status-offline {
  color: var(--danger-color);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container.logs-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--light-text);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.logs-filter {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.logs-container {
  background-color: #1e293b;
  color: #f8fafc;
  border-radius: 4px;
  padding: 10px;
  height: 350px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 14px;
}

.log-entry {
  display: flex;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.error {
  color: #f87171;
}

.log-entry.warn {
  color: #fbbf24;
}

.log-entry.info {
  color: #60a5fa;
}

.log-entry.debug {
  color: #a3a3a3;
}

.log-time {
  width: 180px;
  flex-shrink: 0;
}

.log-level {
  width: 70px;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
}

.no-logs {
  padding: 20px;
  text-align: center;
  color: #a3a3a3;
}

@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .settings-nav {
    display: flex;
    overflow-x: auto;
    padding: 10px;
  }

  .nav-item {
    padding: 10px 15px;
    flex-shrink: 0;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .logs-filter {
    flex-direction: column;
    gap: 10px;
  }

  .log-entry {
    flex-direction: column;
    padding: 10px;
  }

  .log-time, .log-level, .log-message {
    width: 100%;
  }

  .log-time, .log-level {
    margin-bottom: 4px;
  }
}
</style>
