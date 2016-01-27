define('DelayExecutionModule', ['ext-base', 'terrasoft', 'sandbox', 'Activity', 'ProcessModule', 'CardViewGenerator',
	'ConfigurationEnums', 'DelayExecutionModuleResources', 'LookupUtilities', 'ProcessModuleUtilities'],
	function(Ext, Terrasoft, sandbox, Activity, ProcessModule, CardViewGenerator, ConfigurationEnums, resources,
		LookupUtilities, ProcessModuleUtilities) {
		var viewModel;
		var durationInterval = {
			interval5Minutes: {value: '5', displayValue: resources.localizableStrings.Minutes5},
			interval10Minutes: {value: '10', displayValue: resources.localizableStrings.Minutes10},
			interval30Minutes: {value: '30', displayValue: resources.localizableStrings.Minutes30},
			interval1Hour: {value: '60', displayValue: resources.localizableStrings.Hours1},
			interval2Hours: {value: '120', displayValue: resources.localizableStrings.Hours2},
			interval1Day: {value: '1440', displayValue: resources.localizableStrings.Days1}
		};
		var remindInterval = {
			interval5Minutes: {value: '5',
				displayValue: resources.localizableStrings.Before + resources.localizableStrings.Minutes5},
			interval10Minutes: {value: '10',
				displayValue: resources.localizableStrings.Before + resources.localizableStrings.Minutes10},
			interval30Minutes: {value: '30',
				displayValue: resources.localizableStrings.Before + resources.localizableStrings.Minutes30},
			interval1Hour: {value: '60',
				displayValue: resources.localizableStrings.Before + resources.localizableStrings.Hours1},
			interval2Hours: {value: '120',
				displayValue: resources.localizableStrings.Before + resources.localizableStrings.Hours2},
			interval1Day: {value: '1440',
				displayValue: resources.localizableStrings.Before + resources.localizableStrings.Days1}
		};

		function getContainerConfig(id) {
			return {
				className: 'Terrasoft.Container',
				items: [],
				id: id,
				selectors: {
					wrapEl: '#' + id
				}
			};
		}

		function getComboBoxEditConfig(name, caption, isRequired, getListDataMethod) {
			var labelClass = ['controlCaption'];
			if (isRequired === true) {
				labelClass.push('required-caption');
			}
			return [
				{
					className: 'Terrasoft.Label',
					caption: caption,
					classes: {
						labelClass: labelClass
					}
				},
				{
					className: 'Terrasoft.ComboBoxEdit',
					isRequired: isRequired,
					value: {
						bindTo: name + 'Value'
					},
					list: {
						bindTo: name + 'List'
					},
					prepareList: {
						bindTo: getListDataMethod
					},
					classes: {
						wrapClass: 'controlBaseedit'
					}
				}
			];
		}

		function addSchemaColumnToContainer(container, entitySchema, column) {
			var structureColumn = Terrasoft.deepClone(column);
			structureColumn.type = Terrasoft.ViewModelSchemaItem.ATTRIBUTE;
			var items = container.items;
			var labelConfig = CardViewGenerator.generateLabelConfig(entitySchema, structureColumn, {});
			var controlConfig = CardViewGenerator.generateControlConfig(entitySchema, structureColumn, {},
				ConfigurationEnums.CardState.Edit);
			if (controlConfig.visible) {
				labelConfig.visible = controlConfig.visible;
			}
			if (structureColumn.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
				var containerBoolean = getContainerConfig(structureColumn.name + 'container');
				containerBoolean.classes = {
					wrapClassName: 'delay-check-box-container'
				};
				labelConfig.labelClass = 't-label delay-check-box-label-container';
				controlConfig.classes = {
					wrapClass: ['delay-check-box-value-container']
				};
				containerBoolean.items.push(controlConfig, labelConfig);
				items.push(containerBoolean);
				return;
			}
			if (structureColumn.captionVisible !== false) {
				items.push(labelConfig);
			}
			items.push(controlConfig);
		}

		function getView(viewModel) {
			var entitySchema = viewModel.entitySchema;
			var containerMain = getContainerConfig('delayExecutionContainer');
			var containerLeft = getContainerConfig('delayExecutionLeftPart');
			var containerRight = getContainerConfig('delayExecutionRightPart');
			containerMain.items = [containerLeft, containerRight];
			Ext.apply(containerMain, {
				visible: {
					bindTo: 'delayExecutionContainerVisible'
				}
			});
			addSchemaColumnToContainer(containerLeft, entitySchema, viewModel.columns.DelayStartDate);
			var delayDurationContainer = getContainerConfig('delayDurationContainer');
			var durationContainer = getContainerConfig('durationContainer');
			var remindContainer = getContainerConfig('remindContainer');
			durationContainer.items = Ext.Array.merge(durationContainer.items, getComboBoxEditConfig('DelayDuration',
				resources.localizableStrings.DelayDurationCaption, true, 'getDurationListData'));
			remindContainer.items = Ext.Array.merge(remindContainer.items, getComboBoxEditConfig('DelayRemindBefore',
				resources.localizableStrings.DelayRemindBeforeCaption, true, 'getRemindListData'));
			delayDurationContainer.items.push(durationContainer);
			delayDurationContainer.items.push(remindContainer);
			containerLeft.items.push(delayDurationContainer);
			addSchemaColumnToContainer(containerLeft, entitySchema, viewModel.columns.DelayShowInScheduler);
			var containerButtons = getContainerConfig('delayExecutionButtons');
			containerButtons.items = [
				{
					className: 'Terrasoft.Button',
					caption: resources.localizableStrings.OKCaption,
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					click: {
						bindTo: 'save'
					},
					tag: 'save',
					width: '86px'
				},
				{
					className: 'Terrasoft.Button',
					caption: resources.localizableStrings.CancelCaption,
					click: {
						bindTo: 'cancel'
					},
					width: '85px'
				}
			];
			containerLeft.items.push(containerButtons);
			addSchemaColumnToContainer(containerRight, entitySchema, viewModel.columns.DelayOwner);
			addSchemaColumnToContainer(containerRight, entitySchema, viewModel.columns.DelayTitle);
			return Ext.create('Terrasoft.Container', containerMain);
		}

		function getViewModel() {
			return Ext.create('Terrasoft.BaseViewModel', {
				entitySchema: Activity,
				columns: {
					Id: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'Id',
						columnPath: 'Id'
					},
					DelayTitle: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'DelayTitle',
						columnPath: 'Title',
						caption: Activity.columns.Title.caption,
						dataValueType: Activity.columns.Title.dataValueType,
						isRequired: Activity.columns.Title.isRequired,
						captionVisible: true,
						customConfig: {
							id: 'delayTitle',
							className: 'Terrasoft.MemoEdit'
						}
					},
					DelayOwner: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'DelayOwner',
						columnPath: 'Owner',
						caption: Activity.columns.Owner.caption,
						dataValueType: Activity.columns.Owner.dataValueType,
						isRequired: Activity.columns.Owner.isRequired,
						captionVisible: true
					},
					DelayStartDate: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'DelayStartDate',
						columnPath: 'StartDate',
						caption: Activity.columns.StartDate.caption,
						dataValueType: Activity.columns.StartDate.dataValueType,
						isRequired: Activity.columns.StartDate.isRequired,
						captionVisible: true
					},
					DelayDueDate: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'DelayDueDate',
						columnPath: 'DueDate'
					},
					DelayRemindToAuthorDate: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'DelayRemindToAuthorDate',
						columnPath: 'RemindToAuthorDate'
					},
					DelayShowInScheduler: {
						type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
						name: 'DelayShowInScheduler',
						columnPath: 'ShowInScheduler',
						caption: Activity.columns.ShowInScheduler.caption,
						dataValueType: Activity.columns.ShowInScheduler.dataValueType,
						isRequired: Activity.columns.ShowInScheduler.isRequired,
						captionVisible: true
					},
					DelayDurationValue: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						isRequired: true
					},
					DelayRemindBeforeValue: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						isRequired: true
					}
				},
				values: {
					DelayDurationValue: durationInterval.interval1Hour,
					DelayRemindBeforeValue: remindInterval.interval10Minutes,
					DelayDurationList: new Terrasoft.Collection(),
					DelayRemindBeforeList: new Terrasoft.Collection(),
					delayExecutionContainerVisible: true
				},
				methods: {
					save: function() {
						var startDate = this.get('DelayStartDate');
						var duration = this.get('DelayDurationValue');
						var remindBefore = this.get('DelayRemindBeforeValue');
						if (!startDate || !duration || !remindBefore) {
							return;
						}
						var dueDate = Ext.Date.add(startDate, Ext.Date.MINUTE, duration.value);
						this.set('DelayDueDate', dueDate);
						var remindDate = Ext.Date.subtract(startDate, Ext.Date.MINUTE, remindBefore.value);
						this.set('DelayRemindToAuthorDate', remindDate);
						this.saveEntity(function() {
							var currentState = sandbox.publish('GetHistoryState');
							var newState = Terrasoft.deepClone(currentState.state || {});
							var executionData = newState.executionData;
							delete executionData[executionData.currentProcElUId];
							delete executionData.currentProcElUId;
							ProcessModule.replaceHistoryState(currentState, newState);
							if (ProcessModuleUtilities.getProcExecDataCollectionCount(executionData) > 0) {
								ProcessModule.changeNextProcExecDataHistoryState(executionData);
							} else {
								Terrasoft.Router.back();
							}
						}, this);
					},
					cancel: function() {
						this.set('delayExecutionContainerVisible', false);
					},
					getDurationListData: function(filter, list) {
						list.clear();
						list.loadAll(durationInterval);
					},
					getRemindListData: function(filter, list) {
						list.clear();
						list.loadAll(remindInterval);
					}
				}
			});
		}

		function render(renderTo) {
			if (viewModel) {
				var _view = getView(viewModel);
				_view.bind(viewModel);
				_view.render(renderTo);
				return;
			}
			var processExecData = sandbox.publish('GetProcessExecData');
			if (!Ext.isEmpty(processExecData)) {
				viewModel = getViewModel();
				viewModel.loadVocabulary = function(args, tag) {
					var viewModelColumn = viewModel.columns[tag];
					var config = {
						entitySchemaName: this.entitySchema.columns[viewModelColumn.columnPath].referenceSchemaName,
						multiSelect: false,
						columnName: viewModelColumn.name,
						searchValue: args.searchValue
					};
					sandbox.publish('ShowLookupPage', config);
					var self = this;
					sandbox.subscribe('LookupResultSelected', function(args) {
						var columnName = args.columnName;
						var collection = args.selectedRows;
						if (collection.getCount() > 0) {
							self.set(columnName, collection.getItems()[0]);
						}
					});
				};
				var view = getView(viewModel);
				view.bind(viewModel);
				view.render(renderTo);
				viewModel.loadEntity(processExecData.activityRecordId);
			}
		}

		return {
			render: render
		};

	});