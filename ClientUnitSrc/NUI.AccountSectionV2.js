define("AccountSectionV2", ["RightUtilities", "ConfigurationConstants"],
	function(RightUtilities, ConfigurationConstants) {
	return {
		entitySchemaName: "Account",
		attributes: {
			"canUseGoogleOrSocialFeaturesByBuildType": {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				value: false
			}
		},
		contextHelpId: "1001",
		messages: {
			/**
			 * @message GetMapsConfig
			 * Определяет параметры, необходимые при показе адреса объекта на карте
			 * @param {Object} Параметры, используемые для показа адреса объекта на карте
			 */
			"GetMapsConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			/**
			 * @message SetInitialisationData
			 * Устанавливает изначальные параметры поиска в социальных сетях
			 */
			"SetInitialisationData": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {
			/**
			 * @overridden
			 */
			init: function() {
				this.checkCanSearchDuplicates();
				this.callParent(arguments);
				var sysSettings = ["BuildType"];
				Terrasoft.SysSettings.querySysSettings(sysSettings, function() {
					var buildType = Terrasoft.SysSettings.cachedSettings.BuildType &&
						Terrasoft.SysSettings.cachedSettings.BuildType.value;
					this.set("canUseGoogleOrSocialFeaturesByBuildType", buildType !==
						ConfigurationConstants.BuildType.Public);
				}, this);
			},

			/**
			 * @overridden
			 */
			initContextHelp: function() {
				this.set("ContextHelpId", 1001);
				this.callParent(arguments);
			},

			/**
			 * Проверяет есть ли у пользователя право на поиск дублей
			 * согласно системной настройке "Поиск дублей" (CanSearchDuplicates)
			 * @overridden
			 * @returns {Boolean} Возвращает результат: есть ли у пользователя право на поиск дублей
			 */
			checkCanSearchDuplicates: function() {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanSearchDuplicates"
				}, function(result) {
					this.set("canSearchDuplicates", result);
				}, this);
			},

			/**
			 * Получает колонки, которые всегда выбираются запросом
			 * @protected
			 * @overridden
			 * @return {Object} Возвращает колонки, которые всегда выбираются запросом
			 */
			getGridDataColumns: function() {
				var gridDataColumns = this.callParent(arguments);
				if (!gridDataColumns.Name) {
					gridDataColumns.Name = {
						path: "Name"
					};
				}
				if (!gridDataColumns.PrimaryContact) {
					gridDataColumns.PrimaryContact = {
						path: "PrimaryContact"
					};
				}
				return gridDataColumns;
			},

			/**
			 * Действие "Показать на карте"
			 */
			openShowOnMap: function() {
				var items = this.getSelectedItems();
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "Account"
				});
				select.addColumn("Id");
				select.addColumn("Name");
				select.addColumn("Address");
				select.addColumn("City");
				select.addColumn("Region");
				select.addColumn("Country");
				select.addColumn("GPSN");
				select.addColumn("GPSE");
				select.filters.add("AcountIdFilter", this.Terrasoft.createColumnInFilterWithParameters("Id", items));
				select.getEntityCollection(function(result) {
					if (result.success) {
						var mapsConfig = {
							mapsData: []
						};
						result.collection.each(function(item) {
							var address = [];
							if (item.get("Country") && item.get("Country").displayValue) {
								address.push(item.get("Country").displayValue);
							}
							if (item.get("Region") && item.get("Region").displayValue) {
								address.push(item.get("Region").displayValue);
							}
							if (item.get("City") && item.get("City").displayValue) {
								address.push(item.get("City").displayValue);
							}
							address.push(item.get("Address"));
							var dataItem = {
								caption: item.get("Name"),
								content: "<h2>" + item.get("Name") + "</h2><div>" + address.join(", ") + "</div>",
								address: item.get("Address") ? address.join(", ") : null,
								gpsN: item.get("GPSN"),
								gpsE: item.get("GPSE"),
								updateCoordinatesConfig: {
									schemaName: "Account",
									id: item.get("Id")
								}
							};
							mapsConfig.mapsData.push(dataItem);
						});
						var mapsModuleSandboxId = this.sandbox.id + "_MapsModule" + this.Terrasoft.generateGUID();
						this.sandbox.subscribe("GetMapsConfig", function() {
							return mapsConfig;
						}, [mapsModuleSandboxId]);
						this.sandbox.loadModule("MapsModule", {
							id: mapsModuleSandboxId,
							keepAlive: true
						});
					}
				}, this);
			},

			/**
			 * Действие "Найти дубли"
			 */
			openDuplicatesModule: function() {
				this.sandbox.publish("PushHistoryState", {hash: "DuplicatesModule/Account"});
			},

			/**
			 * @obsolete
			 */
			findContactsInSocialNetworks: function() {
				var activeRowId = this.get("ActiveRow");
				var selectedRowId = this.get("SelectedRows");
				if (!activeRowId) {
					if (selectedRowId.length > 0) {
						activeRowId = selectedRowId[0];
					}
				}
				if (activeRowId) {
					var gridData = this.get("GridData");
					var activeRow = gridData.get(activeRowId);
					var recordName = activeRow.get(this.primaryDisplayColumnName);
					var config = {
						entitySchemaName: "Account",
						mode: "search",
						recordId: activeRowId,
						recordName: recordName
					};
					var historyState = this.sandbox.publish("GetHistoryState");
					this.sandbox.publish("PushHistoryState", {
						hash: historyState.hash.historyState,
						silent: true
					}, this);
					this.sandbox.loadModule("FindContactsInSocialNetworksModule", {
						renderTo: "centerPanel",
						id: this.sandbox.id + "_FindContactsInSocialNetworksModule",
						keepAlive: true
					});
					this.sandbox.subscribe("ResultSelectedRows", function(args) {
						this.set("Number", args.name);
						this.set("SocialMediaId", args.id);
					}, this, [this.sandbox.id + "_FindContactsInSocialNetworksModule"]);
					this.sandbox.subscribe("SetInitialisationData", function() {
						return config;
					}, [this.sandbox.id + "_FindContactsInSocialNetworksModule"]);
				}
			},

			/**
			 * Возвращает коллекцию действий раздела в режиме отображения реестра
			 * @protected
			 * @overridden
			 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
			 * отображения реестра
			 */
			getSectionActions: function() {
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Click": {"bindTo": "openShowOnMap"},
					"Caption": {"bindTo": "Resources.Strings.ShowOnMapActionCaption"},
					"Enabled": {"bindTo": "isAnySelected"}
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Click": {"bindTo": "openDuplicatesModule"},
					"Caption": {"bindTo": "Resources.Strings.DuplicatesActionCaption"},
					"Visible": {"bindTo": "canSearchDuplicates"}
				}));
				return actionMenuItems;
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
