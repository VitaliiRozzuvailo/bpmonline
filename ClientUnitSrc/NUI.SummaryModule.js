define('SummaryModule', ['ext-base', 'terrasoft', 'sandbox', 'SummaryView', 'SummaryViewModel',
	'SummaryModuleResources', 'performancecountermanager'],
	function(Ext, Terrasoft, sandbox, SummaryView, SummaryViewModel, resources, performanceCounterManager) {

		var renderTo;
		var itemsCollection;
		var functionsCollection;
		var schemaName;
		var firstLoad;
		var profile;
		var profileKey;
		var quickFilterModuleId;

		function getSummaries(profile, filters, callback) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: schemaName
				}
			);
			var count = profile.length;
			for (var i = 0; i < count; i++) {
				switch (profile[i][1]) {
					case 'COUNT':
						select.addAggregationSchemaColumn(profile[i][0],
							Terrasoft.AggregationType.COUNT, profile[i][0] + profile[i][1]);
						break;
					case 'SUM':
						select.addAggregationSchemaColumn(profile[i][0],
							Terrasoft.AggregationType.SUM, profile[i][0] + profile[i][1]);
						break;
					case 'AVG':
						select.addAggregationSchemaColumn(profile[i][0],
							Terrasoft.AggregationType.AVG, profile[i][0] + profile[i][1]);
						break;
					case 'MIN':
						select.addAggregationSchemaColumn(profile[i][0],
							Terrasoft.AggregationType.MIN, profile[i][0] + profile[i][1]);
						break;
					case 'MAX':
						select.addAggregationSchemaColumn(profile[i][0],
							Terrasoft.AggregationType.MAX, profile[i][0] + profile[i][1]);
						break;
					default :
						break;
				}
			}
			if (filters && filters.collection.length > 0) {
				select.filters.add('quickFilter', filters);
			}
			select.getEntityCollection(callback, this);
		}

		function addItemsFromProfile(renderTo, itemsCollection, filters) {
			var container = renderTo;
			if (profile && profile.length > 0) {
				getSummaries(profile, filters,
					function(result) {
						var i = 0;
						var entities = result.collection.collection.items;
						var settingsList = profile;
						var itemsList = itemsCollection;
						Terrasoft.each(entities[0].values, function(value) {
							var count = itemsList.getCount();
							var key = 'item_' + count;
							var viewModel = Ext.create('Terrasoft.BaseViewModel', SummaryViewModel.generateItem());
							var view = Ext.create("Terrasoft.Container", SummaryView.generateItem(container, key));
							viewModel.key = key;
							viewModel.set('columnCaption', settingsList[i][2] + ': ');
							var columnDataValueType = entities[0].getColumnByName(settingsList[i][0] +
								settingsList[i][1]).dataValueType;
							value = Terrasoft.utils.getTypedStringValue(value, columnDataValueType);
							viewModel.set('columnValue', value);
							viewModel.deleteItem = function() {
								var item = itemsList.removeByKey(this.key);
								item.view.destroy();
								this.destroy();
								saveDataToProfile(itemsList);
							};
							view.bind(viewModel);
							itemsList.add(key, {
								view: view,
								viewModel: viewModel,
								array: [settingsList[i][0], settingsList[i][1], settingsList[i][2], settingsList[i][3],
									settingsList[i][4]]
							});
							i++;
						});
						performanceCounterManager.setTimeStamp('loadAdditionalModulesComplete');
					}
				);
			}
		}

		function saveDataToProfile(itemsList) {
			var array = [];
			itemsList.each(function(item) {
				array.push([item.array[0], item.array[1], item.array[2], item.array[3], item.array[4]]);
			});
			profile = array;
			Terrasoft.utils.saveUserProfile(profileKey, profile, false);
		}

		function updateSummaryItems(itemsCollection, filters) {
			if (profile && profile.length > 0) {
				getSummaries(profile, filters,
					function(result) {
						var i = 0;
						var entities = result.collection.collection.items;
						var settingsList = profile;
						var itemsList = itemsCollection;
						Terrasoft.each(entities[0].values, function(value) {
							var key = 'item_' + i;
							var item = itemsList.get(key);
							var viewModel = item.viewModel;
							var columnDataValueType = entities[0].getColumnByName(settingsList[i][0] +
								settingsList[i][1]).dataValueType;
							value = Terrasoft.utils.getTypedStringValue(value, columnDataValueType);
							viewModel.set('columnValue', value);
							i++;
						});
						performanceCounterManager.setTimeStamp('loadAdditionalModulesComplete');
					}
				);
			}
		}

		function init() {
			this.itemsCollection = new Terrasoft.Collection();
			this.firstLoad = true;
		}

		function render(renderTo) {
			var container = this.renderTo = renderTo;
			var itemsCollection = this.itemsCollection;
			var firstLoad = this.firstLoad;
			schemaName = sandbox.publish('GetSectionSchemaName');

			//TODO: Change for using hash if need use current module in custom module
			quickFilterModuleId = sandbox.publish('GetQuickFilterModuleId');
			profileKey = 'Section-' + schemaName + '-MainGrid-Summary';
			require(['profile!' + profileKey], function(loadedProfile) {
				if (moduleInstance.isDestroyed) {
					return;
				}
				profile = loadedProfile;
				var view = Ext.create("Terrasoft.Container", SummaryView.generate(container));
				var summariesContainer = Ext.get('summariesContainer');
				var viewModel = Ext.create('Terrasoft.BaseViewModel', SummaryViewModel.generate());
				var filters = sandbox.publish('GetQuickFilter', null, [quickFilterModuleId]);
				if (filters) {
					addItemsFromProfile(container, itemsCollection, filters);
					firstLoad = false;
				}
				view.bind(viewModel);
				sandbox.subscribe('QuickFilterChanged', function() {
					var renderTo = summariesContainer;
					var summariesCollection = itemsCollection;
					var filters = sandbox.publish('GetQuickFilter', null, [quickFilterModuleId]);
					if (firstLoad) {
						addItemsFromProfile(renderTo, summariesCollection, filters);
						firstLoad = false;
					}
					else {
						updateSummaryItems(summariesCollection, filters);
					}
				}, [quickFilterModuleId]);
			});
		}

		var moduleInstance = {
			init : init,
			render : render
		};

		return moduleInstance;

	});