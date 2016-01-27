define("UsersDetailV2", ["StorageUtilities"],
    function(StorageUtilities) {
        return {
            entitySchemaName: "VwSysAdminUnit",
            diff: /**SCHEMA_DIFF*/ [{
                "operation": "insert",
                "name": "AddImportOfLDAPUsers",
                "parentName": "AddRecordButton",
                "propertyName": "menu",
                "values": {
                    "caption": {
                        "bindTo": "Resources.Strings.AddImportOfLDAPUsers"
                    },
                    "click": {
                        "bindTo": "importLDAPUsers"
                    },
                    "enabled": {
                        "bindTo": "IsImportOfLDAPUsersEnabled"
                    }
                }
            }] /**SCHEMA_DIFF*/ ,
            methods: {
                /*
                 * Инициализирует страницу
                 * @protected
                 * overridden
                 */
                init: function() {
                    this.callParent(arguments);
                    this.setImportOfLDAPUsersEnabled();
                },
                /*
                 * Отрисовывает деталь
                 * @protected
                 * overridden
                 */
                onRender: function(){
                    this.callParent(arguments);
                    this.sandbox.publish("DetailLoaded", null, [this.sandbox.id]);
                },
                /*
                 * Переход на страницу импорта пользователей LDAP
                 * @private
                 */
                importLDAPUsers: function() {
                    var LDAPHash = "ConfigurationModuleV2/LDAPUserImportPage/";
                    StorageUtilities.setItem(this.get("GroupId"), "LdapGroupId");
                    StorageUtilities.setItem(this.get("MasterRecordId"), "GroupId");
                    var currentModule = this.sandbox.publish("GetHistoryState").hash.historyState;
                    if (currentModule !== LDAPHash) {
                        var args = {
                            isSilent: true
                        };
                        this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
                        this.sandbox.publish("PushHistoryState", {
                            hash: LDAPHash
                        });
                    }
                },
                /*
                 * Делает пункт Импортировать пользователей LDAP активным
                 * @private
                 */
                setImportOfLDAPUsersEnabled: function() {
                    this.sandbox.subscribe("IsImportEnabled", function(config) {
                        this.set("IsImportOfLDAPUsersEnabled", config.isEnabled);
                        this.set("GroupId", config.id);
                    }, this, [this.sandbox.id]);
                }
            },
            messages: {
                /**
                 * @message CardChanged
                 * Сообщает об активации действия Импортировать пользователей LDAP
                 * @param {Object} config
                 * @param {String} config.id Идентификатор группы LDAP
                 * @param {Object} config.isEnabled Флаг активации пункта меню Импортировать пользователей LDAP
                 */
                "IsImportEnabled": {
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "DetailLoaded": {
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.PUBLISH
                }
            },
            attributes: {
                "IsImportOfLDAPUsersEnabled": {
                    dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
                    type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    value: false
                },
                "GroupId": {
                    dataValueType: this.Terrasoft.DataValueType.GUID
                }
            }
        };
    });