define('LeadSection', ['Lead', 'sandbox', 'LeadSectionStructure', 'LeadSectionResources', 'MaskHelper'],
	function(Lead, sandbox, structure, resources, MaskHelper) {
		structure.userCode = function() {
			this.entitySchema = Lead;
			this.contextHelpId = '1009';
			this.name = 'LeadSectionViewModel';
			var uniqueMapsId = Terrasoft.generateGUID();
			this.columnsConfig = [[{
				cols: 24,
				key: [{
					name: { bindTo: 'LeadName' },
					type: 'title'
				}]
			}], [{
				cols: 6,
				key: [{
					name: { bindTo: 'Account' }
				}]
			}, {
				cols: 6,
				key: [ {
					name: { bindTo: 'Contact' }
				}]
			}, {
				cols: 3,
				key: [{
					name: { bindTo: 'BusinesPhone' }
				}]
			}, {
				cols: 3,
				key: [{
					name: { bindTo: 'Email' }
				}]
			}, {
				cols: 3,
				key: [{
					name: { bindTo: 'City' }
				}]
			}]];
			this.methods.esqConfig = {
				sort: {
					columns: [
						{
							name: 'LeadName',
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
			this.methods.isGridManyRowsSelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length >= 0 ? true : false;
			};
			this.methods.openShowOnMap = function() {
				MaskHelper.ShowBodyMask();
				var items = this.getSelectedItems();
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'Lead'
				});
				select.addColumn('Id');
				select.addColumn('LeadName');
				select.addColumn('Address');
				select.addColumn('City');
				select.addColumn('Region');
				select.addColumn('Country');
				select.filters.add('LeadIdFilter', Terrasoft.createColumnInFilterWithParameters('Id', items));
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
								caption: item.values.LeadName,
								content: '<h2>' + item.values.LeadName + '</h2><div>' + address.join(', ') + '</div>',
								address: item.values.Address ? address.join(', ') : null
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
						});
					}
				}, this);
			};
			this.actions = [{
				caption: '',
				className: 'Terrasoft.MenuSeparator'
			}, {
					caption: resources.localizableStrings.ShowOnMap,
					methodName: 'openShowOnMap',
					enabled: {
						bindTo: 'isGridManyRowsSelected'
					}
				}
			];
			this.loadedColumns = [{
				columnPath: 'LeadName'
			}, {
				columnPath: 'Account'
			}, {
				columnPath: 'Contact'
			}, {
				columnPath: 'BusinesPhone'
			}, {
				columnPath: 'Email'
			}, {
				columnPath: 'City'
			}, {
				columnPath: 'Status.Color'
			}];
			// TODO Закомментировано по замечаниям к Демо от С.Карло 28.05.2013
			/*this.methods.onLoadData = function(response) {
				var responseCollection = response.collection.getItems();
				responseCollection.forEach(function(item) {
					item.customStyle = { 'color': item.get('Status.Color') };
				});
				return response;
			};*/
		};
		return structure;
	});
