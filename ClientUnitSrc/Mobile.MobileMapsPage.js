Ext.define("Terrasoft.view.MapsPage", {
	extend: "Terrasoft.view.BaseConfigurationPage",

	xtype: "mapspage",

	config: {
		id: "MapsPage",
		
		pageType: "Custom",

		navigationPanel: {
			showMenuOnSwipe: true,
			backButton: true
		},

		additionalButtonsPanel: {
			xtype: "container",
			layout: "hbox",
			style: "border-top: 1px solid #e5e5e5; padding-top: 10px; padding-bottom: 10px;" +
				"margin-left: 14px; margin-right: 14px;",
			items: [
				{
					xtype: "button",
					id: "MobileMapPage_currentPositionButton",
					cls: "x-button-secondary",
					text: LocalizableStrings["MapPageCurrentPositionButtonText"]
				},
				{
					xtype: "button",
					id: "MobileMapPage_routeButton",
					cls: "x-button-secondary",
					style: "position: fixed; margin-left: auto; right: 14px;",
					text: LocalizableStrings["MapPageRouteButtonText"]
				}
			]
		},
		
		mapViewContainer: {
			xtype: "container",
			style: "padding:0 14px 14px 14px; width: 100%; height: 90%;"
		},
		
		mapsView: {
			xtype: "tsmaps"
		},

		isCached: false,

		isDraggable: false

	},
	
	/**
	 * @private
	 */
	onMapProviderInitialized: function(map) {
		this.fireEvent("mapinitialized", map);
	},

	/**
	 * @private
	 */
	onMapProviderPointTap: function(map, pointData) {
		this.fireEvent("mapitemtap", map, pointData);
	},

	/**
	 * @private
	 */
	onMapProviderError: function(map, exception) {
		map.hide();
		this.add({
			xtype: "component",
			cls: "x-map-error",
			html: exception.getMessage()
		});
	},
	
	/**
	 * @protected
	 * @virtual
	 */
	initialize: function() {
		this.callParent(arguments);
		this.addCls("x-maps-page");
	},
	
	/**
	 * @protected
	 * @virtual
	 */
	applyMapsView: function(config) {
		config.listeners = {
			providerinitialized: this.onMapProviderInitialized,
			providerpointtap: this.onMapProviderPointTap,
			providererror: this.onMapProviderError,
			scope: this
		};
		return Ext.factory(config);
	},
	
	/**
	 * @protected
	 * @virtual
	 */
	updateAdditionalButtonsPanel: function(newAdditionalButtonsPanel) {
		if (newAdditionalButtonsPanel) {
			this.add(newAdditionalButtonsPanel);
		}
	},
	
	/**
	 * @protected
	 * @virtual
	 */
	updateMapViewContainer: function(newMapViewContainer) {
		if (newMapViewContainer) {
			this.setMapViewContainer(this.add(newMapViewContainer));
		}
	},

	/**
	 * @protected
	 * @virtual
	 */
	updateMapsView: function(newMapsView) {
		if (newMapsView) {
			this.getMapViewContainer().add(newMapsView);
		}
	}

});

/**
 * @class Terrasoft.controller.MapsPage
 */
Ext.define("Terrasoft.controller.MapsPage", {
	extend: "Terrasoft.controller.BaseConfigurationPage",

	config: {
		pageId: null,
		refs: {
			view: "#MapsPage",
			routeButton: "#MobileMapPage_routeButton",
			currentPositionButton: "#MobileMapPage_currentPositionButton"
		},
		control: {
			view: {
				mapinitialized: "onViewMapInitialized",
				mapitemtap: "onViewMapItemTap"
			},
			routeButton : {
				tap: "onRouteButtonTap"
			},
			currentPositionButton: {
				tap: "onCurrentPositionButtonTap"
			}
		}
	},
	
	/**
	 * @private
	 */
	onViewMapInitialized: function(mapView) {
		var historyItem = Terrasoft.PageHistory.getItemByPosition(Terrasoft.PagePositions.Current);
		var data = historyItem.getDefaultRecordData();
		mapView.setModelName(data.modelName);
		mapView.setLatitudeColumn(data.latitudeColumn);
		mapView.setLongitudeColumn(data.longitudeColumn);
		mapView.setBalloonColumns(data.balloonColumns);
		mapView.setBalloonTextFunc(data.balloonTextFunc);
		mapView.setAddressFunc(data.addressFunc);
		//mapView.setMarkersWithNumbers(true);
		var records = data.records;
		if (Ext.isArray(records) && records.length) {
			var store = this.getStore();
			store.setData(records);
		} else {
			mapView.updatePoints();
		}
	},

	/**
	 * @private
	 */
	onViewMapItemTap: function(mapView, itemData) {
	},
	
	/**
	 * @private
	 */
	onRouteButtonTap: function() {
		var mapView = this.getView().getMapsView();
		mapView.showRoute();
	},
	
	/**
	 * @private
	 */
	onCurrentPositionButtonTap: function() {
		var mapView = this.getView().getMapsView();
		mapView.showCurrentPosition();
	},

	/**
	 * @private
	 */
	getStore: function() {
		return this.getView().getMapsView().getStore();
	},
	
	/**
	 * @protected
	 * @virtual
	 */
	getTitle: function() {
		return LocalizableStrings["MapPageTitle"];
	},
	
	/**
	 * @protected
	 * @virtual
	 */
	initializeView: function(view) {
		this.callParent(arguments);
		var historyItem = Terrasoft.PageHistory.getItemByPosition(Terrasoft.PagePositions.Current);
		var data = historyItem.getDefaultRecordData();
		var mapView = view.getMapsView();
		mapView.setProvider(data.provider);
	},

	pageLoadComplete: function() {},
	
	pageUnloadComplete: function() {}

});