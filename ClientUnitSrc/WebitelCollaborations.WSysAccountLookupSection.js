define("WSysAccountLookupSection", ["ConfigurationEnums", "WebitelModuleHelper"],
	function(ConfigurationEnums, WebitelModuleHelper) {
		return {

			/**
			 * Название схемы объекта.
			 * @protected
			 * @overridden
			 * @type {String}
			 */
			entitySchemaName: "WSysAccount",
			methods: {

				//region Methods: Private

				/**
				 * Удаляет учетную запись на сервере Webitel.
				 * @private
				 * @param {Object} record Модель записи.
				 */
				removeUser: function(record) {
					var login = record.get("Login");
					Ext.global.webitel.userRemove(login, WebitelModuleHelper.getHostName(), function(result) {
							if (result.status !== Ext.global.WebitelCommandResponseTypes.Success) {
								var response = result.response;
								this.error(response);
							}
						}.bind(this));
				},

				//endregion

				//region Methods: Protected

				/**
				 * @inheritdoc BaseSectionV2#initAddRecordButtonParameters
				 * @overridden
				 * TODO #CC-870 Убрать после решения вопроса установки SysModuleEditLcz на английские сборки
				 */
				initAddRecordButtonParameters: function() {
					this.callParent(arguments);
					this.set("AddRecordButtonCaption", this.get("Resources.Strings.AddRecordButtonCaption"));
				},

				/**
				 * @inheritdoc Terrasoft.BaseLookupConfigurationSection#addRecord
				 * @overridden
				 */
				addRecord: function() {
					var typeColumnValue = this.Terrasoft.GUID_EMPTY;
					var schemaName = this.getEditPageSchemaName(typeColumnValue);
					if (!schemaName) {
						return;
					}
					this.openCardInChain({
						schemaName: schemaName,
						operation: ConfigurationEnums.CardStateV2.ADD,
						moduleId: this.getChainCardModuleSandboxId(typeColumnValue)
					});
				},

				/**
				 * @inheritdoc Terrasoft.BaseLookupConfigurationSection#getModuleCaption
				 * @overridden
				 */
				getModuleCaption: function() {
					var historyState = this.sandbox.publish("GetHistoryState");
					var state = historyState.state;
					if (state && state.caption) {
						return state.caption;
					}
					return this.get("Resources.Strings.HeaderCaption");
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#onDeleteAccept
				 * @overridden
				 */
				onDeleteAccept: function() {
					var selectedItems = this.getSelectedItems();
					var gridData = this.getGridData();
					Terrasoft.each(selectedItems, function(item) {
						var record = gridData.get(item);
						if (!Ext.isEmpty(record)) {
							this.removeUser(record);
						}
					}, this);
					this.callParent(arguments);
				}

				//endregion

			}
		};
	});
