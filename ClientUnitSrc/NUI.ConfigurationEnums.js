define("ConfigurationEnums", ["ConfigurationEnumsResources", "BusinessRuleModule"],
	function(resources, BusinessRuleModule) {
	var entitySchemaColumnUsageType = {
		General: 0,
		Advanced: 1,
		None: 2
	};
	var cardStateV2 = {
		ADD: "add",
		EDIT: "edit",
		COPY: "copy"
	};
	var cardState = {
		View: "view",
		Edit: "edit",
		Add: "add",
		Copy: "copy",
		Delete: "delete",
		Send: "send",
		Reply: "reply",
		ReplyAll: "replyAll",
		Forward: "forward",
		EditStructure: "editStructure",
		Report: "report"
	};
	var mapsModuleMode = {
		Points: "points",
		Route: "route",
		RouteGeolocation: "routeGeolocation"
	};
	var gridType = {
		LISTED: "listed",
		TILED: "tiled"
	};
	var gridSettingsType = {
		NORMAL: "normal",
		VERTICAL: "vertical",
		MOBILE: "mobile"
	};
	var customViewModelSchemaItem = {
		ITEMS_GROUP: "ITEMS-CONTAINER",
		RADIO_GROUP: "RADIO-CONTAINER",
		BUTTON: "BUTTON",
		CUSTOM_ELEMENT: "CUSTOM-ELEMENT"
	};
	var customViewModelRemindingsMessage = {
		ChangeCountUnreadEmails: "changeCountUnreadEmails",
		ChangeCountRemindings: "changeCountRemindings",
		ChangeCountInfoMessages: "changeCountInfoMessages"
	};
	var aggregationFunctionItem = {
		COUNT: "count",
		EXISTS: "exists"
	};
	var periodicityTimeInterval = {
		hours: {
			value: "F9B62808-FE60-421F-9584-AAFEC1E21C4D",
			displayValue: resources.localizableStrings.HoursCaption,
			index: 0
		},
		minutes: {
			value: "12FE1488-46B1-4DFC-B131-187857F385AE",
			displayValue: resources.localizableStrings.MinutesCaption,
			index: 1
		}
	};

	var workAreaMode = {
		SECTION: 0,
		CARD: 1,
		COMBINED: 2
	};

	return {
		GridType: gridType,
		GridSettingsType: gridSettingsType,
		CardState: cardState,
		CardStateV2: cardStateV2,
		CustomViewModelSchemaItem: customViewModelSchemaItem,
		RemindingsMessage: customViewModelRemindingsMessage,
		AggregationFunction: aggregationFunctionItem,
		PeriodicityTimeInterval: periodicityTimeInterval,
		EntitySchemaColumnUsageType: entitySchemaColumnUsageType,
		MapsModuleMode: mapsModuleMode,
		BusinessRule: BusinessRuleModule.enums,
		WorkAreaMode: workAreaMode
	};
});