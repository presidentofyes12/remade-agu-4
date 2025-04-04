// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConceptValues {
    // Starting with lowest values (negative constituents)
    function isValidConceptValue(int256 value) public pure returns (bool) {
        return (
            // Negative values
            value == CONFIG_ERROR ||
            value == MONITOR_ERROR ||
            value == GLOBAL_CONTROL_ERROR ||
            value == HEALTH_ERROR ||
            value == SERVICE_ERROR ||
            value == RECOVERY_ERROR ||
            value == BACKUP_ERROR ||
            value == FRAMEWORK_ERROR ||
            value == PERFORMANCE_ERROR ||
            value == ADMIN_ERROR ||
            value == VALIDATION_ERROR ||
            value == SYSTEM_ERROR ||
            value == IDENTITY_ERROR ||
            value == API_ERROR ||
            value == INTEGRATION_ERROR ||
            value == CONTROL_ERROR ||
            value == GATEWAY_ERROR ||
            value == PROTOCOL_ERROR ||
            value == NOTIFICATION_ERROR ||
            value == ACCESS_ERROR ||
            value == DISTRIBUTION_ERROR ||
            value == VERIFICATION_ERROR ||
            value == QUALITY_ERROR ||
            value == ANALYSIS_ERROR ||
            value == DATA_ERROR ||
            value == REPORTING_ERROR ||
            value == ANALYTICS_ERROR ||
            value == PROCESS_ERROR ||
            value == MESSAGE_ERROR ||
            value == WORKFLOW_ERROR ||
            value == MANAGEMENT_ERROR ||
            value == COMMUNICATION_ERROR ||
            value == ALERT_ERROR ||
            value == TASK_ERROR ||
            value == LOGIN_ERROR ||
            value == AUTH_ERROR ||
            // Positive values
            value == int256(BASE_ACCESS_STATE) ||
            value == int256(BASIC_USER_RIGHTS) ||
            value == int256(STANDARD_PERMISSIONS) ||
            value == int256(ADVANCED_USER_RIGHTS) ||
            value == int256(BASIC_CONTROL) ||
            value == int256(ENHANCED_CONTROL) ||
            value == int256(COMPLETE_CONTROL) ||
            value == int256(PRIMARY_RULES) ||
            value == int256(STANDARD_ACCESS) ||
            value == int256(DATA_STORAGE) ||
            value == int256(ACCOUNT_ORGANIZATION) ||
            value == int256(DATA_MANAGEMENT) ||
            value == int256(SYSTEM_CONFIG) ||
            value == int256(DATABASE_ARCHITECTURE) ||
            value == int256(SYSTEM_INTEGRATION) ||
            value == int256(USER_MANAGEMENT) ||
            value == int256(PROFILE_MANAGEMENT) ||
            value == int256(ACCOUNT_MANAGEMENT) ||
            value == int256(AUTHENTICATION) ||
            value == int256(SECURITY_DOMAIN) ||
            value == int256(AUTH_PROTOCOL) ||
            value == int256(SECURITY_FRAMEWORK) ||
            value == int256(IDENTITY_MANAGEMENT) ||
            value == int256(CREDENTIAL_SYSTEM) ||
            value == int256(PASSWORD_FRAMEWORK) ||
            value == int256(LOGIN_MANAGEMENT) ||
            value == int256(SECURITY_MANAGEMENT) ||
            value == int256(DATA_VALIDATION) ||
            value == int256(INPUT_VERIFICATION) ||
            value == int256(DATA_QUALITY) ||
            value == int256(VERIFICATION_PROTOCOL) ||
            value == int256(DATA_INTEGRITY) ||
            value == int256(INPUT_VALIDATION) ||
            value == int256(QUALITY_FRAMEWORK) ||
            value == int256(VERIFICATION_MANAGEMENT) ||
            value == int256(QUALITY_MANAGEMENT) ||
            value == int256(PROCESS_MANAGEMENT) ||
            value == int256(WORKFLOW_CONTROL) ||
            value == int256(TASK_MANAGEMENT) ||
            value == int256(PROCESS_AUTOMATION) ||
            value == int256(WORKFLOW_AUTOMATION) ||
            value == int256(TASK_AUTOMATION) ||
            value == int256(PROCESS_FLOW_CONTROL) ||
            value == int256(WORKFLOW_MANAGEMENT) ||
            value == int256(PROCESS_CONTROL_SYSTEM) ||
            value == int256(MESSAGE_MANAGEMENT) ||
            value == int256(NOTIFICATION_FRAMEWORK) ||
            value == int256(ALERT_SYSTEM) ||
            value == int256(COMMUNICATION_MANAGEMENT) ||
            value == int256(MESSAGE_DISTRIBUTION) ||
            value == int256(NOTIFICATION_CONTROL) ||
            value == int256(ALERT_MANAGEMENT) ||
            value == int256(COMMUNICATION_CONTROL) ||
            value == int256(MESSAGE_DISTRIBUTION_FRAMEWORK) ||
            value == int256(BASIC_REPORT_GENERATION) ||
            value == int256(ANALYTICS_DASHBOARD) ||
            value == int256(DATA_REPORTING_FRAMEWORK) ||
            value == int256(ANALYTICS_MANAGEMENT) ||
            value == int256(REPORT_CONTROL_SYSTEM) ||
            value == int256(ANALYTICS_CONTROL_FRAMEWORK) ||
            value == int256(DATA_ANALYSIS_SYSTEM) ||
            value == int256(REPORT_MANAGEMENT_FRAMEWORK) ||
            value == int256(ANALYTICS_DISTRIBUTION_SYSTEM) ||
            value == int256(BASIC_API_MANAGEMENT) ||
            value == int256(INTEGRATION_FRAMEWORK) ||
            value == int256(API_CONTROL_SYSTEM) ||
            value == int256(INTEGRATION_MANAGEMENT) ||
            value == int256(API_GATEWAY_SYSTEM) ||
            value == int256(INTEGRATION_CONTROL_FRAMEWORK) ||
            value == int256(API_DISTRIBUTION_SYSTEM) ||
            value == int256(INTEGRATION_SERVICE_LAYER) ||
            value == int256(API_SERVICE_FRAMEWORK) ||
            value == int256(BASIC_BACKUP_SYSTEM) ||
            value == int256(RECOVERY_FRAMEWORK) ||
            value == int256(BACKUP_MANAGEMENT) ||
            value == int256(RECOVERY_CONTROL_SYSTEM) ||
            value == int256(BACKUP_CONTROL_FRAMEWORK) ||
            value == int256(DATA_RECOVERY_SYSTEM) ||
            value == int256(BACKUP_DISTRIBUTION) ||
            value == int256(RECOVERY_MANAGEMENT_FRAMEWORK) ||
            value == int256(BACKUP_SERVICE_LAYER) ||
            value == int256(BASIC_MONITORING_SYSTEM) ||
            value == int256(HEALTH_CHECK_FRAMEWORK) ||
            value == int256(SYSTEM_MONITOR_CONTROL) ||
            value == int256(HEALTH_MANAGEMENT_SYSTEM) ||
            value == int256(PERFORMANCE_MONITOR) ||
            value == int256(SYSTEM_HEALTH_FRAMEWORK) ||
            value == int256(MONITOR_DISTRIBUTION_SYSTEM) ||
            value == int256(HEALTH_SERVICE_LAYER) ||
            value == int256(MONITOR_SERVICE_FRAMEWORK) ||
            value == int256(BASIC_SETTINGS_SYSTEM) ||
            value == int256(CONFIGURATION_FRAMEWORK) ||
            value == int256(SETTINGS_MANAGEMENT) ||
            value == int256(CONFIG_CONTROL_SYSTEM) ||
            value == int256(SETTINGS_CONTROL_FRAMEWORK) ||
            value == int256(SYSTEM_PREFERENCES) ||
            value == int256(CONFIGURATION_DISTRIBUTION) ||
            value == int256(SETTINGS_SERVICE_LAYER) ||
            value == int256(CONFIG_SERVICE_FRAMEWORK) ||
            value == int256(BASIC_ADMIN_SYSTEM) ||
            value == int256(GLOBAL_CONTROL_FRAMEWORK) ||
            value == int256(ADMIN_MANAGEMENT) ||
            value == int256(GLOBAL_SETTINGS_CONTROL) ||
            value == int256(ADMIN_CONTROL_FRAMEWORK) ||
            value == int256(SYSTEM_CONTROL_CENTER) ||
            value == int256(GLOBAL_ADMIN_CONSOLE) ||
            value == int256(MASTER_CONTROL_PANEL) ||
            value == int256(FINAL_SYSTEM_CONTROL)
        );
    }

    int256 constant CONFIG_ERROR = -84259259260;              // -84.25925926 
    int256 constant MONITOR_ERROR = -82407407410;            // -82.40740741
    int256 constant GLOBAL_CONTROL_ERROR = -76851851850;     // -76.85185185
    int256 constant HEALTH_ERROR = -75925925930;             // -75.92592593 
    int256 constant SERVICE_ERROR = -74074074070;            // -74.07407407
    int256 constant RECOVERY_ERROR = -73148148150;           // -73.14814815
    int256 constant BACKUP_ERROR = -72222222220;             // -72.22222222
    int256 constant FRAMEWORK_ERROR = -71296296300;          // -71.2962963
    int256 constant PERFORMANCE_ERROR = -70370370370;        // -70.37037037
    int256 constant ADMIN_ERROR = -69444444440;              // -69.44444444
    int256 constant VALIDATION_ERROR = -68518518520;         // -68.51851852
    int256 constant SYSTEM_ERROR = -67592592590;             // -67.59259259
    int256 constant IDENTITY_ERROR = -66666666670;           // -66.66666667
    int256 constant API_ERROR = -65740740740;                // -65.74074074
    int256 constant INTEGRATION_ERROR = -64814814810;        // -64.81481481
    int256 constant CONTROL_ERROR = -63888888890;            // -63.88888889
    int256 constant GATEWAY_ERROR = -62962962960;            // -62.96296296
    int256 constant PROTOCOL_ERROR = -61111111110;           // -61.11111111
    int256 constant NOTIFICATION_ERROR = -60185185190;       // -60.18518519
    int256 constant ACCESS_ERROR = -59259259260;             // -59.25925926
    int256 constant DISTRIBUTION_ERROR = -58333333330;       // -58.33333333
    int256 constant VERIFICATION_ERROR = -57407407410;       // -57.40740741
    int256 constant QUALITY_ERROR = -56481481480;            // -56.48148148
    int256 constant ANALYSIS_ERROR = -55555555560;           // -55.55555556
    int256 constant DATA_ERROR = -54629629630;               // -54.62962963
    int256 constant REPORTING_ERROR = -53703703700;          // -53.7037037
    int256 constant ANALYTICS_ERROR = -52777777780;          // -52.77777778
    int256 constant PROCESS_ERROR = -51851851850;            // -51.85185185
    int256 constant MESSAGE_ERROR = -50925925930;            // -50.92592593
    int256 constant WORKFLOW_ERROR = -50000000000;           // -50.00000000
    int256 constant MANAGEMENT_ERROR = -49074074070;         // -49.07407407
    int256 constant COMMUNICATION_ERROR = -48148148150;      // -48.14814815
    int256 constant ALERT_ERROR = -47222222220;              // -47.22222222
    int256 constant TASK_ERROR = -46296296300;               // -46.2962963
    int256 constant LOGIN_ERROR = -45370370370;              // -45.37037037
    int256 constant AUTH_ERROR = -44444444440;               // -44.44444444

    // Moving to positive values - base concepts and constituents 
    uint256 constant BASE_ACCESS_STATE = 0;                  // 0.000000000
    uint256 constant BASIC_USER_RIGHTS = 925925926;         // 0.925925926
    uint256 constant STANDARD_PERMISSIONS = 1851851852;      // 1.851851852
    uint256 constant ADVANCED_USER_RIGHTS = 2777777778;      // 2.777777778
    uint256 constant BASIC_CONTROL = 3703703704;            // 3.703703704
    uint256 constant ENHANCED_CONTROL = 4629629630;         // 4.62962963
    uint256 constant COMPLETE_CONTROL = 5555555556;         // 5.555555556
    uint256 constant PRIMARY_RULES = 6481481481;            // 6.481481481
    uint256 constant STANDARD_ACCESS = 7407407407;          // 7.407407407
    uint256 constant DATA_STORAGE = 8333333333;             // 8.333333333
    uint256 constant ACCOUNT_ORGANIZATION = 9259259259;     // 9.259259259
    uint256 constant DATA_MANAGEMENT = 10185185190;         // 10.18518519
    uint256 constant SYSTEM_CONFIG = 11111111110;           // 11.11111111
    uint256 constant DATABASE_ARCHITECTURE = 12037037040;   // 12.03703704
    uint256 constant SYSTEM_INTEGRATION = 12962962960;      // 12.96296296
    uint256 constant USER_MANAGEMENT = 13888888890;         // 13.88888889
    uint256 constant PROFILE_MANAGEMENT = 14814814810;      // 14.81481481
    uint256 constant ACCOUNT_MANAGEMENT = 15740740740;      // 15.74074074
    uint256 constant AUTHENTICATION = 16666666670;          // 16.66666667
    uint256 constant SECURITY_DOMAIN = 17592592590;         // 17.59259259
    uint256 constant AUTH_PROTOCOL = 18518518520;           // 18.51851852
    uint256 constant SECURITY_FRAMEWORK = 19444444440;      // 19.44444444
    uint256 constant IDENTITY_MANAGEMENT = 20370370370;     // 20.37037037
    uint256 constant CREDENTIAL_SYSTEM = 21296296300;       // 21.2962963
    uint256 constant PASSWORD_FRAMEWORK = 22222222220;      // 22.22222222
    uint256 constant LOGIN_MANAGEMENT = 23148148150;        // 23.14814815
    uint256 constant SECURITY_MANAGEMENT = 24074074070;     // 24.07407407
    uint256 constant DATA_VALIDATION = 25000000000;         // 25.00000000
    uint256 constant INPUT_VERIFICATION = 25925925930;      // 25.92592593
    uint256 constant DATA_QUALITY = 26851851850;            // 26.85185185
    uint256 constant VERIFICATION_PROTOCOL = 27777777780;   // 27.77777778
    uint256 constant DATA_INTEGRITY = 28703703700;          // 28.7037037
    uint256 constant INPUT_VALIDATION = 29629629630;        // 29.62962963
    uint256 constant QUALITY_FRAMEWORK = 30555555560;       // 30.55555556
    uint256 constant VERIFICATION_MANAGEMENT = 31481481480;  // 31.48148148
    uint256 constant QUALITY_MANAGEMENT = 32407407410;      // 32.40740741
    uint256 constant PROCESS_MANAGEMENT = 33333333330;      // 33.33333333
    uint256 constant WORKFLOW_CONTROL = 34259259260;        // 34.25925926
    uint256 constant TASK_MANAGEMENT = 35185185190;         // 35.18518519
    uint256 constant PROCESS_AUTOMATION = 36111111110;      // 36.11111111

    // Process and Workflow Continuation (36.111111110 - 40.740740741)
    uint256 constant WORKFLOW_AUTOMATION = 37037037040;        // 37.03703704
    uint256 constant TASK_AUTOMATION = 37962962960;            // 37.96296296
    uint256 constant PROCESS_FLOW_CONTROL = 38888888890;       // 38.88888889
    uint256 constant WORKFLOW_MANAGEMENT = 39814814810;        // 39.81481481
    uint256 constant PROCESS_CONTROL_SYSTEM = 40740740740;     // 40.74074074

    // Notification and Messaging Systems (40.740740741 - 49.074074074)
    uint256 constant MESSAGE_MANAGEMENT = 41666666670;         // 41.66666667
    uint256 constant NOTIFICATION_FRAMEWORK = 42592592590;     // 42.59259259
    uint256 constant ALERT_SYSTEM = 43518518520;               // 43.51851852
    uint256 constant COMMUNICATION_MANAGEMENT = 44444444440;   // 44.44444444
    uint256 constant MESSAGE_DISTRIBUTION = 45370370370;       // 45.37037037
    uint256 constant NOTIFICATION_CONTROL = 46296296300;       // 46.2962963
    uint256 constant ALERT_MANAGEMENT = 47222222220;           // 47.22222222
    uint256 constant COMMUNICATION_CONTROL = 48148148150;      // 48.14814815
    uint256 constant MESSAGE_DISTRIBUTION_FRAMEWORK = 49074074070; // 49.07407407

    // Reporting and Analytics (49.074074074 - 57.407407407)
    uint256 constant BASIC_REPORT_GENERATION = 50000000000;    // 50.00000000
    uint256 constant ANALYTICS_DASHBOARD = 50925925930;        // 50.92592593
    uint256 constant DATA_REPORTING_FRAMEWORK = 51851851850;   // 51.85185185
    uint256 constant ANALYTICS_MANAGEMENT = 52777777780;       // 52.77777778
    uint256 constant REPORT_CONTROL_SYSTEM = 53703703700;      // 53.7037037
    uint256 constant ANALYTICS_CONTROL_FRAMEWORK = 54629629630; // 54.62962963
    uint256 constant DATA_ANALYSIS_SYSTEM = 55555555560;       // 55.55555556
    uint256 constant REPORT_MANAGEMENT_FRAMEWORK = 56481481480; // 56.48148148
    uint256 constant ANALYTICS_DISTRIBUTION_SYSTEM = 57407407410; // 57.40740741

    // Integration and API Systems (57.407407407 - 65.740740741)
    uint256 constant BASIC_API_MANAGEMENT = 58333333330;       // 58.33333333
    uint256 constant INTEGRATION_FRAMEWORK = 59259259260;      // 59.25925926
    uint256 constant API_CONTROL_SYSTEM = 60185185190;         // 60.18518519
    uint256 constant INTEGRATION_MANAGEMENT = 61111111110;     // 61.11111111
    uint256 constant API_GATEWAY_SYSTEM = 62037037040;         // 62.03703704
    uint256 constant INTEGRATION_CONTROL_FRAMEWORK = 62962962960; // 62.96296296
    uint256 constant API_DISTRIBUTION_SYSTEM = 63888888890;    // 63.88888889
    uint256 constant INTEGRATION_SERVICE_LAYER = 64814814810;  // 64.81481481
    uint256 constant API_SERVICE_FRAMEWORK = 65740740740;      // 65.74074074

    // Backup and Recovery Systems (65.740740741 - 74.074074074)
    uint256 constant BASIC_BACKUP_SYSTEM = 66666666670;        // 66.66666667
    uint256 constant RECOVERY_FRAMEWORK = 67592592590;         // 67.59259259
    uint256 constant BACKUP_MANAGEMENT = 68518518520;          // 68.51851852
    uint256 constant RECOVERY_CONTROL_SYSTEM = 69444444440;    // 69.44444444
    uint256 constant BACKUP_CONTROL_FRAMEWORK = 70370370370;   // 70.37037037
    uint256 constant DATA_RECOVERY_SYSTEM = 71296296300;       // 71.2962963
    uint256 constant BACKUP_DISTRIBUTION = 72222222220;        // 72.22222222
    uint256 constant RECOVERY_MANAGEMENT_FRAMEWORK = 73148148150; // 73.14814815
    uint256 constant BACKUP_SERVICE_LAYER = 74074074070;       // 74.07407407

    // Monitoring and Health Systems (74.074074074 - 82.407407407)
    uint256 constant BASIC_MONITORING_SYSTEM = 75000000000;    // 75.00000000
    uint256 constant HEALTH_CHECK_FRAMEWORK = 75925925930;     // 75.92592593
    uint256 constant SYSTEM_MONITOR_CONTROL = 76851851850;     // 76.85185185
    uint256 constant HEALTH_MANAGEMENT_SYSTEM = 77777777780;   // 77.77777778
    uint256 constant PERFORMANCE_MONITOR = 78703703700;        // 78.7037037
    uint256 constant SYSTEM_HEALTH_FRAMEWORK = 79629629630;    // 79.62962963
    uint256 constant MONITOR_DISTRIBUTION_SYSTEM = 80555555560; // 80.55555556
    uint256 constant HEALTH_SERVICE_LAYER = 81481481480;       // 81.48148148
    uint256 constant MONITOR_SERVICE_FRAMEWORK = 82407407410;  // 82.40740741

    // Configuration and Settings Systems (82.407407407 - 90.740740741)
    uint256 constant BASIC_SETTINGS_SYSTEM = 83333333330;      // 83.33333333
    uint256 constant CONFIGURATION_FRAMEWORK = 84259259260;    // 84.25925926
    uint256 constant SETTINGS_MANAGEMENT = 85185185190;        // 85.18518519
    uint256 constant CONFIG_CONTROL_SYSTEM = 86111111110;      // 86.11111111
    uint256 constant SETTINGS_CONTROL_FRAMEWORK = 87037037040; // 87.03703704
    uint256 constant SYSTEM_PREFERENCES = 87962962960;         // 87.96296296
    uint256 constant CONFIGURATION_DISTRIBUTION = 88888888890; // 88.88888889
    uint256 constant SETTINGS_SERVICE_LAYER = 89814814810;     // 89.81481481
    uint256 constant CONFIG_SERVICE_FRAMEWORK = 90740740740;   // 90.74074074

    // Administration and Global Control Systems (90.740740741 - 100.000000000)
    uint256 constant BASIC_ADMIN_SYSTEM = 91666666670;         // 91.66666667
    uint256 constant GLOBAL_CONTROL_FRAMEWORK = 92592592590;   // 92.59259259
    uint256 constant ADMIN_MANAGEMENT = 93518518520;           // 93.51851852
    uint256 constant GLOBAL_SETTINGS_CONTROL = 94444444440;    // 94.44444444
    uint256 constant ADMIN_CONTROL_FRAMEWORK = 95370370370;    // 95.37037037
    uint256 constant SYSTEM_CONTROL_CENTER = 96296296300;      // 96.2962963
    uint256 constant GLOBAL_ADMIN_CONSOLE = 97222222220;       // 97.22222222
    uint256 constant MASTER_CONTROL_PANEL = 98148148150;       // 98.14814815
    uint256 constant FINAL_SYSTEM_CONTROL = 100000000000;      // 100.00000000
}