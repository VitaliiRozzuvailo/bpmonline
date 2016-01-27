define("ContactSectionV2", [],
	function() {
		return {
			entitySchemaName: "Contact",
			methods: {

				/**
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					this.initContactSyncSettings();
				},

				/**
				 * Проверяет наличие настроек синхронизации контактов с Exchange
				 * и устанавливает соответствующее свойство модели.
				 * @protected
				 */
				initContactSyncSettings: function() {
					this.set("IsExchangeContactSyncExist", false);
					var select = this.getBaseContactSyncSettingsSelect();
					select.addAggregationSchemaColumn("Id", this.Terrasoft.AggregationType.COUNT, "Count");
					select.getEntityCollection(function(response) {
						if (response.success) {
							this.set("IsExchangeContactSyncExist", response.collection.getCount() > 0 &&
								response.collection.getItems()[0].get("Count") > 0);
						}
					}, this);
				},

				/**
				 * Синхронизирует контакты с Exchange.
				 * @protected
				 */
				synchronizeExchangeContacts: function() {
					var select = this.getBaseContactSyncSettingsSelect();
					select.addColumn("Id");
					select.addColumn("[MailboxSyncSettings:Id:MailboxSyncSettings].SenderEmailAddress",
						"SenderEmailAddress");
					select.getEntityCollection(function(response) {
						if (response.success) {
							if (response.collection.getCount() < 1) {
								this.Terrasoft.utils.showInformation(
									this.get("Resources.Strings.SyncSettingsNotFoundMessage")
								);
								return;
							}
							this.createSyncJobs(response.collection);
						} else {
							this.Terrasoft.utils.showInformation(
								this.get("Resources.Strings.ReadSyncSettingsBadResponse")
							);
						}
					}, this);
				},

				/**
				 * Создает в расписании планировщика задачу по синхронизации контактов с сервера Exchange.
				 * @private
				 * @param {Terrasoft.Collection} collection Коллекция экземпляров сущностей.
				 */
				createSyncJobs: function(collection) {
					var requestsCount = 0;
					var messageArray = [];
					var requestUrl = this.Terrasoft.workspaceBaseUrl +
						"/rest/MailboxSettingsService/CreateContactSyncJob";
					collection.each(function(item) {
						var data = {
							interval: 0,
							senderEmailAddress: item.get("SenderEmailAddress")
						};
						this.showBodyMask();
						requestsCount++;
						this.Terrasoft.AjaxProvider.request({
							url: requestUrl,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							method: "POST",
							jsonData: data,
							scope: this,
							callback: function(request, success, response) {
								if (success) {
									var responseData = Ext.decode(response.responseText);
									if (!Ext.isEmpty(responseData.CreateContactSyncJobResult)) {
										messageArray = messageArray.concat(responseData.CreateContactSyncJobResult);
									}
								}
								if (--requestsCount <= 0) {
									var message = this.get("Resources.Strings.SynchronizeExchangeSuccessMessage");
									if (messageArray.length > 0) {
										message = "";
										this.Terrasoft.each(messageArray, function(element) {
											message = message.concat(element);
										}, this);
									}
									this.hideBodyMask();
									this.Terrasoft.utils.showInformation(message);
								}
							}
						});
					}, this);
				},

				/**
				 * Возвращает {Terrasoft.EntitySchemaQuery} с фильтрами по пользователю
				 * и выбором типа синхронизации контактов.
				 * @private
				 */
				getBaseContactSyncSettingsSelect: function() {
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ContactSyncSettings"
					});
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"[MailboxSyncSettings:Id:MailboxSyncSettings].SysAdminUnit",
						this.Terrasoft.SysValue.CURRENT_USER.value));
					var filterGroup = select.createFilterGroup();
					filterGroup.name = "SynContactsFilterGroup";
					filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
					filterGroup.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"ImportContacts", true));
					filterGroup.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"ExportContacts", true));
					select.filters.addItem(filterGroup);
					return select;
				},

				/**
				 * Возвращает коллекцию действий раздела в режиме отображения реестра.
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
				 * отображения реестра.
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.SynchronizeExchangeContactsCaption"},
						Click: {bindTo: "synchronizeExchangeContacts"},
						Enabled: {bindTo: "IsExchangeContactSyncExist"}
					}));
					return actionMenuItems;
				}
			},
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});
