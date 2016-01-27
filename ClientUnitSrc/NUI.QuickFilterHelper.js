define('QuickFilterHelper', ['ext-base', 'terrasoft'],
	function(Ext, Terrasoft) {

		/**
		 * Parameters:
		 * "sandbox" - required, sandbox
		 * "id" - required, need for use several blocks on page
		 */
		function constructorFunc(args) {
			if (!args) {
				return;
			}

			var quickFilterModuleId;
			var quickFilterContainerId;
			var quickFilterKey = args.id;
			var sandbox = args.sandbox;
			var selectedFolderPropertyName = 'selectedFolderFilters' + quickFilterKey;
			var customFilterPropertyName = 'customFilter' + quickFilterKey;

			/**
			 * Quick filter container must be added by this method
			 * Parameters:
			 * "containerId" - Id for Quick filter container
			 */
			function getQuickFilterContainerConfig(containerId, wrapClassName) {
				quickFilterContainerId = containerId;
				return {
					className: 'Terrasoft.Container',
					id: containerId,
					selectors: {
						wrapEl: '#' + containerId
					},
					classes: {
						wrapClassName: [wrapClassName]
					},
					items: []
				};
			}

			/**
			 * Parameters:
			 * "isInit" - is methods called on module 1st load, need for prevent duplicate subscribes
			 * "entitySchema" - required, module grid entity schema
			 * "onQuickFilterChanged" - required, quick filter changed handler (would call in viewModel context)
			 * "viewModel" - required, module view model
			 */
			function loadQuickFilter(quickFiltersParams) {
				if (!quickFiltersParams) { //TODO: Check args here
					return;
				}
				var viewModel = quickFiltersParams.viewModel;
				var quickFilterContainer = Ext.get(quickFilterContainerId);
				quickFilterModuleId = sandbox.id + '_QuickFilterModule' + quickFilterKey;

				if (quickFiltersParams.isInit) {
					sandbox.subscribe('GetModuleSchema', function() {
						return quickFiltersParams.entitySchema;
					}, [quickFilterModuleId]);

					sandbox.subscribe('GetQuickFilterParams', function() {
						return { quickFilterKey : quickFilterKey };
					}, [quickFilterModuleId]);

					sandbox.subscribe('QuickFilterChanged', function() {
						quickFiltersParams.onQuickFilterChanged.call(viewModel);
					}, [quickFilterModuleId]);

					sandbox.subscribe('OpenFolderPage', function(args) {
						var params = sandbox.publish('GetHistoryState');
						var moduleId = sandbox.id + '_FolderLookupPage' + quickFilterKey;

						sandbox.subscribe('ResultSelectedFolders', function(args) {
							viewModel.set(selectedFolderPropertyName, args.folders);
						}, [moduleId]);
						sandbox.subscribe('FolderInfo', function() {
							return args.config;
						}, [moduleId]);
						sandbox.publish('PushHistoryState', { hash: params.hash.historyState });
						sandbox.loadModule('FolderLookupPage', {
							renderTo: Ext.get('centerPanel'),
							id: moduleId,
							keepAlive: true
						});
					}, [quickFilterModuleId]);

					//NOTE: Add custom filter
					sandbox.subscribe('CustomFilterExtendedMode', function(args) {
						var moduleId = sandbox.id + '_ExtendedFilterEditModule' + quickFilterKey;
						var params = sandbox.publish('GetHistoryState');
						sandbox.publish('PushHistoryState', {hash: params.hash.historyState});

						sandbox.subscribe('GetModuleSchema', function() {
							return quickFiltersParams.entitySchema;
						}, [moduleId]);

						sandbox.subscribe('GetExtendedFilter', function() {
							return args.extendedFilter;
						}, [moduleId]);

						sandbox.subscribe('ResultExtendedFilter', function(args) {
							var extendedFilter = args.filter && args.filter.getCount() ?
							{
								value: args.serializedFilter,
								displayValue: getExtendedFilterDisplayValue(args.filter)
							}
							: null;

							viewModel.set(customFilterPropertyName, extendedFilter ? { extendedFilter: extendedFilter }
								: {});
						}, [moduleId]);

						sandbox.loadModule('ExtendedFilterEditModule', {
							renderTo: Ext.get('centerPanel'),
							keepAlive: true,
							id: moduleId
						});
					}, [quickFilterModuleId]);
				}

				sandbox.loadModule('QuickFilterModule', {
					renderTo: quickFilterContainer,
					id: quickFilterModuleId
				});
			}

			/**
			 * Parameters:
			 * "viewModel" - required, module view model
			 */
			function addFiltersToHistoryState(params) {
				if (!params) {
					return;
				}
				var viewModel = params.viewModel;

				var historyState = sandbox.publish('GetHistoryState');
				var currentState = historyState.state || {};
				var newState = Terrasoft.deepClone(currentState);
				var filterState = currentState[quickFilterKey] || {};
				filterState.selectedFolderFilters = viewModel.get(selectedFolderPropertyName);

				var customFilter = viewModel.get(customFilterPropertyName);
				if (customFilter) {
					filterState.customFilterState = customFilter;
					viewModel.set(customFilterPropertyName, null);
				}
				newState[quickFilterKey] = filterState;
				var currentHash = historyState.hash;
				sandbox.publish('ReplaceHistoryState', {
					stateObj: newState,
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
			}

			/**
			 * Parameters:
			 * esq - required, entity schema query
			 * viewModel - required, module view model
			 */
			function applyQuickFilters(params) {
				if (!params) {
					return;
				}
				var viewModel = params.viewModel;

				var quickFilter = sandbox.publish('GetQuickFilter', null, [quickFilterModuleId]);
				var folderFilter = sandbox.publish('GetFolderFilter', null, [quickFilterModuleId]);
				if (quickFilter && quickFilter.getCount()) {
					params.esq.filters.add('quickFilter', quickFilter);
				}
				viewModel.set(selectedFolderPropertyName, folderFilter);
			}

			/**
			 * Private method.
			 * Parameters
			 * "extendedFilter" - extended filter definition
			 */
			function getExtendedFilterDisplayValue(extendedFilter) {
				var comparisonTypeFlipped = Terrasoft.invert(Terrasoft.ComparisonType);
				var logicalOperatorTypeFlipped = Terrasoft.invert(Terrasoft.LogicalOperatorType);

				function getComparisonDisplayValue(comparison) {
					var comparisonType = comparisonTypeFlipped[comparison];
					return Terrasoft.Resources.ComparisonType[comparisonType];
				}

				function getLogicalOperatorDisplayvalue(operator) {
					var type = logicalOperatorTypeFlipped[operator];
					return Terrasoft.Resources.LogicalOperatorType[type];
				}

				var displayValue = '';

				function getDisplayValue(filter) {
					if (this.index++ > 0) {
						displayValue = displayValue + ' ' + getLogicalOperatorDisplayvalue(this.logicalOperation) + ' ';
					}
					if (filter.collection) {
						if (filter.collection.length > 0) {
							var innerScope = {
								level: this.level + 1,
								index: 0,
								logicalOperation: filter.logicalOperation,
								getDisplayValue: this.getDisplayValue
							};
							if (this.level !== 0) {
								displayValue = displayValue + '(';
							}
							filter.each(getDisplayValue, innerScope);
							if (this.level !== 0) {
								displayValue = displayValue + ')';
							}
						}
					} else {
						displayValue = displayValue + filter.leftExpressionCaption + ' ' +
							getComparisonDisplayValue(filter.comparisonType) + ' ' +
							Terrasoft.getRightExpressionDisplayValue(filter);
					}
				}

				var scope = {
					level: 0,
					index: 0,
					logicalOperation: 0,
					getDisplayValue: getDisplayValue
				};

				scope.getDisplayValue(extendedFilter);
				return displayValue;
			}

			/**
			 * Module should have following messages:
			 * "GetHistoryState" - ptp - publish
			 * "PushHistoryState" - broadcast - publish
			 * "ReplaceHistoryState" - broadcast - publish
			 * "QuickFilterChanged" - broadcast - subscribe
			 * "OpenFolderPage" - broadcast - subscribe
			 * "ResultSelectedFolders" - broadcast - subscribe
			 * "ResultExtendedFilter" - broadcast - subscribe
			 * "CustomFilterExtendedMode" - broadcast - subscribe
			 * "FolderInfo" - ptp - subscribe
			 * "GetExtendedFilter" - ptp - subscribe
			 * "GetModuleSchema" - ptp - subscribe
			 * "GetQuickFilterKey" - ptp - subscribe
			 * "GetQuickFilterParams" - ptp - subscribe
			 * "GetQuickFilter" - ptp - publish
			 * "GetFolderFilter" - ptp - publish
			 */
			var moduleInstance = {
				addFiltersToHistoryState: addFiltersToHistoryState,
				loadQuickFilter: loadQuickFilter,
				applyQuickFilters: applyQuickFilters,
				getQuickFilterContainerConfig: getQuickFilterContainerConfig
			};

			return moduleInstance;
		}

		var constructor = {
			getQuickFilterHelper: constructorFunc
		};

		return constructor;
	}
);