define("AccountSectionV2", ["MapsUtilities", "MapsHelper"],
	function(MapsUtilities, MapsHelper) {
		return {
			entitySchemaName: "Account",
			methods: {
				/**
				 * Действие "Показать на карте".
				 */
				openShowOnMap: function () {
					MapsHelper.openShowOnMap.call(this, this.entitySchemaName, function (mapsConfig) {
						MapsUtilities.open({
							scope: this,
							mapsConfig: mapsConfig
						});
					});
				}
			},
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});
