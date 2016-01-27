define("SysAdminUnitSectionV2", ["SysAdminUnitSectionV2Resources", "GridUtilitiesV2"],
	function() {
		return {
			entitySchemaName: "SysAdminUnit",
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * (Устаревший) Запускает процесс синхронизации с LDAP
				 * @protected
				 */
				syncWithLDAP: function() {
					var obsoleteMessage = this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage;
					this.log(Ext.String.format(obsoleteMessage, "syncWithLDAP", "runLDAPSync"));
					this.runLDAPSync();
				},

				/**
				 * (Устаревший) Запускает процесс импорта групп и пользователей из LDAP
				 * @protected
				 */
				importLDAPElements: function() {
					var obsoleteMessage = this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage;
					this.log(Ext.String.format(obsoleteMessage, "importLDAPElements", "runLDAPSync"));
					this.runLDAPSync();
				},

				/**
				 * Возвращает конфиг сервиса запуска процесса синхронизации синхронизации с LDAP.
				 * @protected
				 * @return {Object} config обьект, который содержит название сервиса, название метода, данные.
				 * отображения реестра
				 */
				getLDAPSyncConfig: function() {
					var jobName = "RunSyncWithLDAP";
					var syncJobGroupName = "LDAP";
					var syncProcessName = "RunLDAPSync";
					var data = {
						JobName: jobName + Terrasoft.SysValue.CURRENT_USER.value,
						SyncJobGroupName: syncJobGroupName,
						SyncProcessName: syncProcessName,
						periodInMinutes: 0,
						recreate: true
					};
					var config = {
						serviceName: "SchedulerJobService",
						methodName: "CreateSyncJobWithResponse",
						data: data
					};
					return config;
				},

				/**
				 * Запускает процесс синхронизации с LDAP
				 * @protected
				 */
				runLDAPSync: function() {
					this.showBodyMask();
					this.callService(this.getLDAPSyncConfig(), function(response) {
								this.runLDAPSyncCallback.call(this, response.CreateSyncJobWithResponseResult);
							}, this);
				},

				/**
				* Функция обратного вызова процесса синхронизации с LDAP.
				* @protected
				 */
				runLDAPSyncCallback: function(response) {
					var message;
					if (response.success) {
						message = this.get("Resources.Strings.RunLDAPSuccessMessage");
					}
					else {
						message = this.get("Resources.Strings.SyncProcessFail");errorInfo
					}
					this.hideBodyMask();
					if (message) {
						this.Terrasoft.utils.showInformation(message, null, null, {buttons: ["ok"]});
					}
				},

				/**
				 * Возвращает коллекцию действий раздела.
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме.
				 * отображения реестра
				 */
				getCustomSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getSyncWithLDAPButton());
					return actionMenuItems;
				},

				/**
				 * Возвращает кнопку "Синхронизировать с LDAP".
				 * @protected
				 * @return {Terrasoft.BaseViewModel} Возвращает кнопку.
				 */
				getSyncWithLDAPButton: function() {
					return this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.SyncronizeWithLDAPButtonCaption"},
						"Click": {"bindTo": "runLDAPSync"}
					});
				}
			}
		};
	});