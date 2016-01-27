define('AccountSection', ['sandbox', 'Account', 'AccountSectionStructure', 'AccountSectionResources', 'MaskHelper'],
	function(sandbox, Account, structure, resources, MaskHelper) {
		structure.userCode = function() {
			this.entitySchema = Account;
			this.contextHelpId = '1001';
			this.name = 'AccountSectionViewModel';
			var uniqueMapsId = Terrasoft.generateGUID();
			this.columnsConfig = [
				[
					{
						cols: 9,
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
						cols: 6,
						key: [
							{
								name: {
									bindTo: 'PrimaryContact'
								}
							}
						]
					},
					{
						cols: 5,
						key: [
							{
								name: {
									bindTo: 'Phone'
								}
							}
						]
					},
					{
						cols: 4,
						key: [
							{
								name: {
									bindTo: 'Code'
								}
							}
						]
					}
				],
				[
					{
						cols: 5,
						key: [
							{
								name: {
									bindTo: 'Web'
								}
							}
						]
					},
					{
						cols: 4,
						key: [
							{
								name: {
									bindTo: 'Type'
								}
							}
						]
					},
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'AccountCategory'
								}
							}
						]
					},
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'City'
								}
							}
						]
					},
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'Country'
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
					columnPath: 'PrimaryContact'
				},
				{
					columnPath: 'Code'
				},
				{
					columnPath: 'Phone'
				},
				{
					columnPath: 'Type'
				},
				{
					columnPath: 'Web'
				},
				{
					columnPath: 'AccountCategory'
				},
				{
					columnPath: 'City'
				},
				{
					columnPath: 'Country'
				}
			];
			this.methods.esqConfig = {
				sort: {
					columns: [
						{
							name: 'Name',
							orderPosition: 0,
							orderDirection: Terrasoft.OrderDirection.ASC
						}
					]
				}
			};
			this.methods.getSelectedItems = function() {
				var isMultiSelect = this.get('multiSelect');
				if (isMultiSelect) {
					return this.get('selectedRows');
				} else {
					var selectedItem = this.get('activeRow');
					if (!Ext.isEmpty(selectedItem)) {
						return [selectedItem];
					}
					return null;
				}
			};
			this.methods.isGridRowsSelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length === 1 ? true : false;
			};
			this.methods.isGridManyRowsSelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length >= 0 ? true : false;
			};
			this.methods.openShowOnMap = function() {
				MaskHelper.ShowBodyMask();
				var items = this.getSelectedItems();
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'Account'
				});
				select.addColumn('Id');
				select.addColumn('Name');
				select.addColumn('Address');
				select.addColumn('City');
				select.addColumn('Region');
				select.addColumn('Country');
				select.addColumn('GPSN');
				select.addColumn('GPSE');
				select.filters.add('AcountIdFilter', Terrasoft.createColumnInFilterWithParameters('Id', items));
				select.getEntityCollection(function(result) {
					if (result.success) {
						var sandbox = this.getSandbox();
						var mapsConfig = {
							mapsData: []
						};
						Terrasoft.each(result.collection.getItems(), function(item) {
							var address = [];
							if (item.values.Country.displayValue) {
								address.push(item.values.Country.displayValue);
							}
							if (item.values.Region.displayValue) {
								address.push(item.values.Region.displayValue);
							}
							if (item.values.City.displayValue) {
								address.push(item.values.City.displayValue);
							}
							address.push(item.values.Address);
							var dataItem = {
								caption: item.values.Name,
								content: '<h2>' + item.values.Name + '</h2><div>' + address.join(', ') + '</div>',
								address: item.values.Address ? address.join(', ') : null,
								gpsN: item.values.GPSN,
								gpsE: item.values.GPSE,
								updateCoordinatesConfig: {
									schemaName: 'Account',
									id: item.values.Id
								}
							};
							mapsConfig.mapsData.push(dataItem);
						});
						var mapsModuleSandboxId = sandbox.id + '_MapsModule' + uniqueMapsId;
						sandbox.subscribe('GetMapsConfig', function() {
							return mapsConfig;
						}, [mapsModuleSandboxId]);
						sandbox.loadModule('MapsModule', {
								id: mapsModuleSandboxId,
								keepAlive: true
							}
						);
					}
				}, this);
			};
			this.actions = getActions();
		};
		structure.methods.openDuplicatesModule = function() {
			MaskHelper.ShowBodyMask();
			sandbox.publish('PushHistoryState', { hash: 'DuplicatesModule/Account'});
		};
		structure.methods.findContactsInSocialNetworks = function() {
			MaskHelper.ShowBodyMask();
			var activeRow = this.get('activeRow');
			if (activeRow !== undefined) {
				var gridData = this.get('gridData');
				var recordName = gridData.get(activeRow).get(this.primaryDisplayColumnName);
				sandbox.publish('PushHistoryState', {hash: 'FindContactsInSocialNetworksModule',
					stateObj: { entitySchemaName: 'Account', mode: 'search',
					recordId: activeRow, recordName: recordName}});
			}
		};
		function getActions() {
			var actions = [];
			actions.push({
				caption: '',
				className: 'Terrasoft.MenuSeparator'
			}, {
				caption: resources.localizableStrings.DuplicatesAction,
				methodName: "openDuplicatesModule"
			}, {
				caption: resources.localizableStrings.ShowOnMap,
				methodName: 'openShowOnMap',
				enabled: {
					bindTo: 'isGridManyRowsSelected'
				}
			});
			if (Terrasoft.SysSettings.cachedSettings.BuildType !== 'e45eb864-59cc-4325-8276-d85e1ba90c95') {
				actions.push({
					caption: '',
					className: 'Terrasoft.MenuSeparator'
				}, {
					caption: resources.localizableStrings.FindContactsInSocialNetworksAction,
					schemaName: "FindContactsInSocialNetworksModule",
					methodName: "findContactsInSocialNetworks",
					enabled: {
						bindTo: 'isGridRowsSelected'
					}
				});
			}
			return actions;
		}
		return structure;
	});
