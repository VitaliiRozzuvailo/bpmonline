define('AccountBillingInfoDetail', ['AccountBillingInfo',
	'AccountBillingInfoDetailStructure'],
	function(AccountBillingInfo, structure) {
		structure.userCode = function() {
			this.entitySchema = AccountBillingInfo;
			this.name = 'AccountBillingInfoDetailViewModel';
			this.editPageName = 'AccountBillingInfoPage';
			this.typeColumn = "Type";
			this.columnsConfig = [
				[
					{
						cols: 8,
						key: [
							{
								name: {
									bindTo: 'Name'
								},
								type: 'title'
							}
						]
					},
					{
						cols: 16,
						key: [
							{
								name: {
									bindTo: 'BillingInfo'
								}
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'Name'
				},
				{
					columnPath: 'BillingInfo'
				}
			];
			this.methods.setEntitySchema = function() {
				this.entitySchema = AccountBillingInfo;
			};

		};
		return structure;
	});