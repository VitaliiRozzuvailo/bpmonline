define("BaseAddressDetailV2", ["MapsUtilities", "MapsHelper"],
	function(MapsUtilities, MapsHelper) {
		return {
			methods: {
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
						var address = MapsHelper.getFullAddress.call(item);
						var content = this.Ext.String.format("<h2>{0}</h2><div>{1}</div>", addressType, address);
						var dataItem = {
							caption: addressType,
							content: content,
							address: address
						};
						mapsData.push(dataItem);
					}, this);
					MapsUtilities.open({
						scope: this,
						mapsConfig: mapsConfig
					});
				}
			},
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});
