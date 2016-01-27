define("CommerceIntro", ["CommerceIntroResources"], function(resources) {
	return {
		attributes: {},
		methods: {},
		diff: [
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "BasicTile",
				"name": "LeadSectionV2",
				"index": 1,
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.LeadSectionCaption"},
					"tag": "SectionModuleV2/LeadSectionV2/",
					"click": {"bindTo": "onNavigateTo"}
				}
			},
			{
				"operation": "insert",
				"name": "SalesTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"index": 1,
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.SalesCaption"},
					"cls": "sales-tile",
					"icon": resources.localizableImages.SalesIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SalesTile",
				"name": "OrderSectionV2",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.OrderSectionCaption"},
					"tag": "SectionModuleV2/OrderSectionV2/",
					"click": {"bindTo": "onNavigateTo"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SalesTile",
				"name": "InvoiceSectionV2",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.InvoiceSectionCaption"},
					"tag": "SectionModuleV2/InvoiceSectionV2/",
					"click": {"bindTo": "onNavigateTo"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SalesTile",
				"name": "DocumentSectionV2",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.DocumentSectionCaption"},
					"tag": "SectionModuleV2/DocumentSectionV2/",
					"click": {"bindTo": "onNavigateTo"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SalesTile",
				"name": "ProductSectionV2",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.ProductSectionCaption"},
					"tag": "SectionModuleV2/ProductSectionV2/",
					"click": {"bindTo": "onNavigateTo"}
				}
			},
			{
				"operation": "insert",
				"name": "CommerceVideo",
				"parentName": "VideoPanel",
				"propertyName": "playlist",
				"values": {
					"videoUrl": resources.localizableStrings.VideoUrl,
					"caption": {"bindTo": "Resources.Strings.VideoCaption"}
				}
			}
		]
	};
});
