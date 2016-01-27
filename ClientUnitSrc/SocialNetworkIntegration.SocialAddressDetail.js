define("SocialAddressDetail", ["ConfigurationGrid", "ConfigurationGridGenerator", "ConfigurationGridUtilities",
		"SocialGridDetailUtilities"], function() {
	return {
		messages: {
			/**
			 * Сообщение о необходимости получения данных из социальных сетей.
			 */
			"GetSocialNetworkData": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Соообщение об окончании загрузки данных из социальных сетей.
			 */
			"SocialNetworkDataLoaded": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message SaveDetail
			 * Инициирует сохранение детали.
			 */
			"SaveDetail": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message DetailValidated
			 * Отправляет результат сохранения.
			 */
			"DetailSaved": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		/**
		 * Классы-миксины (примеси), расширяющие функциональность данного класа.
		 */
		mixins: {
			/**
			 * @class ConfigurationGridUtilities реализующий базовые методы редактируемого реестра.
			 */
			ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities",

			/**
			 * @class SocialGridDetailUtilities реализующий базовые методы детали обогащения из соц. сети.
			 * с редактируемым реестром.
			 */
			SocialGridDetailUtilities: "Terrasoft.SocialGridDetailUtilities"
		},
		attributes: {
			/*
			 * Признак включения редактируемого реестра.
			 */
			IsEditable: {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: true
			},

			/*
			 * Признак включения множественного выбора.
			 */
			MultiSelect: {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: true
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#subscribeSandboxEvents
			 * @override
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("SaveDetail", this.save, this, [this.sandbox.id]);
			},

			/**
			 * @inheritdoc Terrasoft.BaseAddressDetailV2#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.initSocialDetail();
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#getToolsVisible
			 * @overridden
			 */
			getToolsVisible: function() {
				return false;
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#getIsRowChanged
			 * @overridden
			 */
			getIsRowChanged: function() {
				return false;
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#onGridDataLoaded
			 * @overridden
			 */
			onGridDataLoaded: function() {
				this.callParent(arguments);
				var socialNetworkData = this.sandbox.publish("GetSocialNetworkData");
				if (!socialNetworkData) {
					this.sandbox.subscribe("SocialNetworkDataLoaded", this.onSocialNetworkDataLoaded, this);
				} else {
					this.onSocialNetworkDataLoaded(socialNetworkData);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#initDetailOptions
			 * @overridden
			 */
			initDetailOptions: function() {
				this.callParent(arguments);
				this.set("IsDetailCollapsed", false);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#addItemsToGridData
			 * @overridden
			 */
			addItemsToGridData: function(items) {
				this.callParent(arguments);
				if (this.get("MultiSelect")) {
					this.selectRows(items);
				}
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#initActiveRowKeyMap
			 * @overridden
			 */
			initActiveRowKeyMap: Terrasoft.emptyFn

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"className": "Terrasoft.ConfigurationGrid",
					"generator": "ConfigurationGridGenerator.generatePartial",
					"generateControlsConfig": {bindTo: "generateActiveRowControlsConfig"},
					"changeRow": {bindTo: "changeRow"},
					"unSelectRow": {bindTo: "unSelectRow"},
					"onGridClick": {bindTo: "onGridClick"},
					"initActiveRowKeyMap": {bindTo: "initActiveRowKeyMap"},
					"activeRowAction": {bindTo: "onActiveRowAction"},
					"activeRowActions": [],
					"rowDataItemMarkerColumnName": "Address"
				}
			},
			{
				"operation": "insert",
				"name": "DataGridActiveRowSaveAction",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
				"values": {
					"className": "Terrasoft.Button",
					"tag": "save",
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"markerValue": "save",
					"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
