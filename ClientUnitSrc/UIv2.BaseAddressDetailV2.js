define("BaseAddressDetailV2", [], function() {
	return {
		messages: {
			/**
			 * @message GetMapsConfig
			 * Определяет параметры, необходимые при показе адреса объекта на карте
			 * @param {Object} Параметры, используемые для показа адреса объекта на карте
			 */
			"GetMapsConfig": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		attributes: {
			/**
			 * Коллекция типов адреса. "Домашний", "Доставки" и т.д.
			 */
			AddressTypes: {dataValueType: this.Terrasoft.DataValueType.COLLECTION}
		},
		methods: {
			init: function(callback, scope) {
				if (!this.get("AddressTypes")) {
					this.initAddressTypes(function() {
						this.init(callback, scope);
					}, this);
				} else {
					this.callParent(arguments);
				}
			},

			/*
			 * @inheritdoc Terrasoft.GridUtilitiesV2#getGridDataColumns
			 * @overridden
			 */
			getGridDataColumns: function() {
				var config = this.callParent(arguments);
				config.AddressType = {path: "AddressType"};
				config.Country = {path: "Country"};
				config.Region = {path: "Region"};
				config.City = {path: "City"};
				config.Address = {path: "Address"};
				config.Zip = {path: "Zip"};
				return config;
			},

			getEntityStructure: function(entitySchemaName) {
				if (!entitySchemaName) {
					return this.callParent(arguments);
				}
				var entityStructure = this.callParent(arguments);
				var typeColumnName = (entityStructure.attribute = "AddressType");
				var addressTypes = this.get("AddressTypes");
				var sourcePage = entityStructure.pages[0];
				var pages = [];
				addressTypes.each(function(addressType) {
					var caption = addressType.get("Name");
					pages.push(Ext.apply({}, {
						"UId": addressType.get("Id"),
						"caption": caption,
						"captionLcz": caption,
						"typeColumnName": typeColumnName
					}, sourcePage));
				}, this);
				entityStructure.pages = pages;
				return entityStructure;
			},

			/**
			 * Инициализирует коллекцию типов адреса.
			 * @protected
			 */
			initAddressTypes: function(callback, scope) {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "AddressType"});
				esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
				var nameColumn = esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
				nameColumn.orderPosition = 1;
				nameColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
				var addressTypeColumnFilter = "";
				var detailColumnName = this.get("DetailColumnName");
				if (detailColumnName === "Contact") {
					addressTypeColumnFilter = "ForContact";
				} else if (detailColumnName === "Account") {
					addressTypeColumnFilter = "ForAccount";
				}
				if (addressTypeColumnFilter) {
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, addressTypeColumnFilter, 1));
				}
				esq.getEntityCollection(function(result) {
					var addressTypes = Ext.create("Terrasoft.BaseViewModelCollection");
					if (result.success) {
						addressTypes = result.collection;
					}
					this.set("AddressTypes", addressTypes);
					callback.call(scope);
				}, this);
			},

			/**
			 * Возвращает полный адрес.
			 * @return {String} Полный адрес.
			 */
			getFullAddress: function() {
				var fullAddress = [];
				var country = this.get("Country");
				if (country) {
					fullAddress.push(country.displayValue);
				}
				var region = this.get("Region");
				if (region) {
					fullAddress.push(region.displayValue);
				}
				var city = this.get("City");
				if (city) {
					fullAddress.push(city.displayValue);
				}
				var address = this.get("Address");
				if (address) {
					fullAddress.push(address);
				}
				return fullAddress.join(", ");
			},

			/**
			 * Действие "Показать на карте".
			 */
			openShowOnMap: function() {
				var addresses = this.getGridData();
				var items = this.getSelectedItems();
				var mapsData = [];
				var mapsConfig = {
					mapsData: mapsData
				};
				this.Terrasoft.each(items, function(itemId) {
					var item = addresses.get(itemId);
					var addressType = item.get("AddressType").displayValue;
					var address = this.getFullAddress.call(item);
					var content = this.Ext.String.format("<h2>{0}</h2><div>{1}</div>", addressType, address);
					var dataItem = {
						caption: item.get("Name"),
						content: content,
						address: address
					};
					mapsData.push(dataItem);
				}, this);
				var mapsModuleSandboxId = this.sandbox.id + "_MapsModule" + this.Terrasoft.generateGUID();
				this.sandbox.subscribe("GetMapsConfig", function() {
					return mapsConfig;
				}, [mapsModuleSandboxId]);
				this.sandbox.loadModule("MapsModule", {
					id: mapsModuleSandboxId,
					keepAlive: true
				});
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
			 * @overridden
			 */
			addRecordOperationsMenuItems: function(toolsButtonMenu) {
				this.callParent(arguments);
				toolsButtonMenu.addItem(this.getButtonMenuSeparator());
				toolsButtonMenu.addItem(this.getButtonMenuItem({
					Caption: {"bindTo": "Resources.Strings.ShowOnMapCaption"},
					Click: {"bindTo": "openShowOnMap"},
					Enabled: {bindTo: "isAnySelected"}
				}));
			},

			/**
			 * Возвращает имя колонки для фильтрации по умолчанию.
			 * @overridden
			 * @return {String} Имя колонки.
			 */
			getFilterDefaultColumnName: function() {
				return "AddressType";
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					type: "listed",
					listedConfig: {
						"name": "DataGridListedConfig",
						"items": [

							{
								"name": "AddressTypeListedGridColumn",
								"bindTo": "AddressType",
								"position": {"column": 1, "colSpan": 5}
							},
							{
								"name": "AddressListedGridColumn",
								"bindTo": "Address",
								"position": {"column": 6, "colSpan": 7}
							},
							{
								"name": "CityListedGridColumn",
								"bindTo": "City",
								"position": {"column": 13, "colSpan": 3}
							},
							{
								"name": "RegionListedGridColumn",
								"bindTo": "Region",
								"position": {"column": 16, "colSpan": 4}
							},
							{
								"name": "CountryListedGridColumn",
								"bindTo": "Country",
								"position": {"column": 20, "colSpan": 3}
							},
							{
								"name": "ZipListedGridColumn",
								"bindTo": "Zip",
								"position": {"column": 23, "colSpan": 2}
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": {"columns": 24, "rows": 1},
						"items": []
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
