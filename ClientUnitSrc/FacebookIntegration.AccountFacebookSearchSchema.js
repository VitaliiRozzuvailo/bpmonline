define("AccountFacebookSearchSchema", ["ConfigurationConstants"], function(ConfigurationConstants) {
	return {
		methods: {
			/**
			 * @inheritdoc Terrasoft.FacebookSearchSchema#getSelectedItems
			 * @overridden
			 */
			getSelectedItems: function() {
				var selectedRows = this.get("SelectedRows");
				var selectedItems = this.Ext.create("Terrasoft.Collection");
				var gridData = this.get("GridData");
				Terrasoft.each(selectedRows, function(rowId) {
					var item = gridData.get(rowId);
					item.set("CommunicationType", ConfigurationConstants.CommunicationTypes.Facebook);
					selectedItems.add(item);
				}, this);
				return selectedItems;
			},

			/**
			 * @inheritdoc Terrasoft.FacebookSearchSchema#getSelectButtonEnabled
			 * @overridden
			 */
			getSelectButtonEnabled: function() {
				var selectedRows = this.get("SelectedRows");
				var activeRowExist = (selectedRows.length > 0);
				return activeRowExist;
			},

			/**
			 * @inheritdoc Terrasoft.FacebookSearchSchema#getFacebookSearchLink
			 * @overridden
			 */
			getFacebookSearchLink: function(searchText) {
				return "https://www.facebook.com/search/results/?q=" + encodeURI(searchText) + "&type=pages";
			}
		},

		diff: [
			{
				"operation": "merge",
				"name": "SocialSearchResultGrid",
				"values": {
					"multiSelect": true,
					"columnsConfig": [
						{
							cols: 2,
							key: {
								name: "Photo",
								bindTo: "Photo",
								type: "grid-listed-icon"
							}
						},
						{
							cols: 6,
							key: {
								name: "Name",
								type: "text"
							},
							link: {"bindTo": "getNameLink"}
						},
						{
							cols: 4,
							key: {
								name: "Category",
								bindTo: "Category",
								type: "text"
							}
						},
						{
							cols: 4,
							key: {
								name: "Web",
								bindTo: "Web",
								type: "text"
							}
						},
						{
							cols: 3,
							key: {
								name: "Phone",
								bindTo: "Phone",
								type: "text"
							}
						},
						{
							cols: 3,
							key: {
								name: "Country",
								bindTo: "Country",
								type: "text"
							}
						},
						{
							cols: 2,
							key: {
								name: "City",
								bindTo: "City",
								type: "text"
							}
						}
					]
				}
			}
		]
	}
});
