define("AccountAddressPageV2", ["BusinessRuleModule", "OsmMapsModule"], function(BusinessRuleModule) {
	return {
		entitySchemaName: "AccountAddress",
		attributes: {

			/**
			 * Признак отображения карты.
			 */
			"isMapShow": {dataValueType: this.Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Адрес.
			 */
			"Address": {
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				dependencies: [
					{
						columns: ["Address"],
						methodName: "updateMap"
					}
				]
			},

			/**
			 * Страна.
			 */
			"Country": {
				dataValueType: this.Terrasoft.DataValueType.LOOKUP,
				dependencies: [
					{
						columns: ["Country"],
						methodName: "updateMap"
					}
				]
			},

			/**
			 * Город.
			 */
			"City": {
				dataValueType: this.Terrasoft.DataValueType.LOOKUP,
				dependencies: [
					{
						columns: ["City"],
						methodName: "updateMap"
					}
				]
			}
		},
		messages: {

			/**
			 * @message GetMapsConfig.
			 * Получает конфиг модуля карт.
			 */
			"GetMapsConfig": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message SetMapsConfig.
			 * Устанавливает конфиг модуля карт.
			 */
			"SetMapsConfig": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message GetCoordinates.
			 * Получает координаты маркера.
			 */
			"GetCoordinates": {
				"mode": this.Terrasoft.MessageMode.PTP,
				"direction": this.Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * Сохраняет новые координаты.
			 * @public
			 * @param {Number} gpsN координата GPSN
			 * @param {Number} gpsE координата GPSE
			 */
			saveAddressCoordinates: function(gpsN, gpsE) {
				if (gpsN && gpsE) {
					this.set("GPSN", gpsN + "");
					this.set("GPSE", gpsE + "");
				}
			},

			/**
			 * Выполняет обновление карты.
			 * @private
			 */
			updateMap: function() {
				this.set("GPSN", "");
				this.set("GPSE", "");
				this.renderMap();
			},

			/**
			 * Выполняет отрисовку карты.
			 * @private
			 */
			renderMap: function() {
				var isMapShow = this.get("isMapShow");
				var mapsModuleSandboxId = this.get("mapsModuleSandboxId");
				var country = this.get("Country");
				var city = this.get("City");
				var region = this.get("Region");
				var address = this.get("Address");
				var gpsN = this.get("GPSN");
				var gpsE = this.get("GPSE");
				var mapsConfig = {
					mapsData: [],
					renderTo: this.Ext.get("Map"),
					scope: this,
					mapsModuleSandboxId: mapsModuleSandboxId
				};
				var markerObject = {};
				if (country && city) {
					var countryValue = country.displayValue;
					var cityValue = city.displayValue;
					var regionValue = region ? region.displayValue : null;
					markerObject.address = [countryValue, regionValue, cityValue];
					markerObject.useDragMarker = true;
					if (address) {
						markerObject.address.push(address);
					}
					if (gpsN && gpsE) {
						markerObject.address = gpsN + ", " + gpsE;
						markerObject.gpsN = gpsN;
						markerObject.gpsE = gpsE;
					}
				} else {
					markerObject.address = "0.0, 0.0";
					markerObject.gpsN = "0.0";
					markerObject.gpsE = "0.0";
					mapsConfig.mapsData.useCurrentUserLocation = true;
				}
				mapsConfig.mapsData.push(markerObject);
				if (isMapShow) {
					this.sandbox.publish("SetMapsConfig", mapsConfig,
						[this.get("mapsModuleSandboxId")]);
				} else {
					this.sandbox.subscribe("GetMapsConfig", function() {
						return mapsConfig;
					}, [mapsModuleSandboxId]);
					this.sandbox.subscribe("GetCoordinates", function(coordinates) {
						var gpsN = coordinates.lat;
						var gpsE = coordinates.lng;
						this.saveAddressCoordinates(gpsN, gpsE);
					}, this, [mapsModuleSandboxId]);
					this.sandbox.loadModule("OsmMapsModule", {
						id: mapsModuleSandboxId,
						keepAlive: true
					});
					this.set("isMapShow", true);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
			 * @override
			 */
			onEntityInitialized: function() {
				this.callParent(arguments);
				this.renderMap();
			},

			/**
			 * Подготавливает данные для модуля карт.
			 * @private
			 */
			prepareMap: function() {
				var uniqueMapsId = Terrasoft.generateGUID();
				var mapsModuleSandboxId = this.sandbox.id + "_MapsModule" + uniqueMapsId;
				this.set("mapsModuleSandboxId", mapsModuleSandboxId);
			}
		},
		details: /**SCHEMA_DETAILS*/{
		}/**SCHEMA_DETAILS*/,
		rules: {
			"AddressType": {
				"FiltrationAddressTypeByOwner": {
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					baseAttributePatch: "ForAccount",
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.CONSTANT,
					value: true
				}
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "AddressMapContainer",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"values": {
					"id": "AddressMapContainer",
					"selectors": {"wrapEl": "#AddressMapContainer"},
					"itemType": this.Terrasoft.ViewItemType.CONTAINER,
					"items": [],
					"wrapClass": ["addressmap"]
				}
			},
			{
				"operation": "insert",
				"parentName": "AddressMapContainer",
				"propertyName": "items",
				"name": "Map",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.MODULE,
					"moduleName": "MapsModule",
					"afterrender": {bindTo: "prepareMap"},
					"afterrerender": {bindTo: "prepareMap"},
					"classes": {"wrapClassName": "osm-maps-user-class"}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});