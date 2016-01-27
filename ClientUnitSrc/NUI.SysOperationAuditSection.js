define('SysOperationAuditSection', ['sandbox', 'SysOperationAudit', 'SysOperationAuditArch',
	'SysOperationAuditSectionStructure', 'SysOperationAuditSectionResources', 'ActionUtilitiesModule',
	'BaseFiltersGenerateModule', 'RightUtilities'],
	function(sandbox, SysOperationAudit, SysOperationAuditArch, structure, resources, ActionUtilitiesModule,
			BaseFiltersGenerateModule, RightUtilities) {

		structure.userCode = function() {
			this.entitySchema = SysOperationAudit;
			this.name = 'SysOperationAuditSectionViewModel';
			this.getEditPages = function() {
				return undefined;
			};
			this.columnsConfig = [
				[
					{
						cols: 24,
						key: [
							{
								name: {
									bindTo: 'Type'
								}
							}
						]
					}
				],
				[
					{
						cols: 6,
						key: [
							{
								name: {
									bindTo: 'Date'
								}
							}
						]
					},
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'Result'
								}
							}
						]
					},
					{
						cols: 4,
						key: [
							{
								name: {
									bindTo: 'ClientIP'
								}
							}
						]
					},
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'Owner'
								}
							}
						]
					},
					{
						cols: 3,
						key: [
							{
								name: {
									bindTo: 'Description'
								}
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'Type'
				},
				{
					columnPath: 'Date'
				},
				{
					columnPath: 'Result'
				},
				{
					columnPath: 'ClientIP'
				},
				{
					columnPath: 'Owner'
				},
				{
					columnPath: 'Description'
				}
			];

			this.methods.esqConfig = {
				sort: {
					columns: [
						{
							name: 'Date',
							orderPosition: 0,
							orderDirection: Terrasoft.OrderDirection.ASC
						}
					]
				}
			};

			this.methods.initViewModel = function() {
				this.set('moveAuditToArchiveActionVisible', true);
				this.set("canManageSysAuditOperationsSection", false);
				loadCanManageSysAuditOperationsSection(this);
			};

			this.methods.getAddButtonVisbility = function() {
				return false;
			};

			var actions = this.actions || [];
			actions.push({
				name: 'moveAuditToArchiveAction',
				caption: resources.localizableStrings.ArchivingAuditActionCaption,
				methodName: 'processMoveAuditToArchive',
				enabled: {
					bindTo: 'canManageSysAuditOperationsSection'
				},
				visible: {
					bindTo: 'moveAuditToArchiveActionVisible'
				}
			});
			this.actions = actions;

			this.methods.modifyUtilsConfig = function(utilsConfig) {
				var buttonPanel = searchInUtilsConfig('button-panel', utilsConfig);
				buttonPanel.items[1].visible = {
					bindTo: "moveAuditToArchiveActionVisible"
				};
				Terrasoft.each(buttonPanel.items[1].menu.items, function(item) {
					item.visible = (item.caption === resources.localizableStrings.ArchivingAuditActionCaption);
				});
			};

			this.methods.processMoveAuditToArchive = function() {
				this.showConfirmationDialog(resources.localizableStrings.MovingToArchiveActionConfirmMessage,
					doMoveAuditToArchive, ['yes', 'no']);
			};

			this.methods.modifyGridConfig = function(gridConfig) {
				gridConfig.activeRowActions = [];
			};

			this.methods.getDefView = function() {
				var activeView = this.getCustomProfileValue('activeView');
				if (!Ext.isEmpty(activeView)) {
					return activeView;
				}
				return 'mainView';
			};

			this.methods.getViews = function(baseGetViews) {
				var views = baseGetViews.call(this);
				views = views.splice(0, 1);
				views.push({
					name: 'archiveView',
					likeMain: true,
					caption: resources.localizableStrings.ArchiveSectionViewCaption
				});
				return views;
			};

			this.methods.viewChanging = function(viewName) {
				var isArchiveView = (viewName === 'archiveView');
				this.entitySchema = isArchiveView ? SysOperationAuditArch : SysOperationAudit;
				this.set('moveAuditToArchiveActionVisible', !isArchiveView);
			};

			this.methods.viewChanged = function() {
				var scope = this;
				sandbox.subscribe('GetSectionEntitySchema', function() {
					return scope.entitySchema;
				});
				sandbox.subscribe('GetSectionSchemaName', function() {
					return scope.entitySchema.name;
				});
			};

			this.methods.openSettingPage = function() {
				var tag = 'SummarySettingsModule/' + this.entitySchema.name;
				sandbox.publish('PushHistoryState', {
					hash: tag,
					stateObj: {
						entityName: this.entitySchema.name,
						cardSandBoxId: sandbox.id
					}
				});
			};

			this.fixedFilterConfig = {
				entitySchema: SysOperationAudit,
				filters: [
					{
						name: 'PeriodFilter',
						caption: resources.localizableStrings.PeriodFilterCaption,
						dataValueType: Terrasoft.DataValueType.DATE,
						columnName: 'Date',
						startDate: {
							defValue: Terrasoft.startOfWeek(new Date())
						},
						dueDate: {
							defValue: Terrasoft.endOfWeek(new Date())
						}
					},
					{
						name: 'Owner',
						caption: resources.localizableStrings.OwnerFilterCaption,
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						filter: BaseFiltersGenerateModule.OwnerFilter,
						columnName: 'Owner',
						defValue: {
							value: Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
							displayValue: Terrasoft.SysValue.CURRENT_USER_CONTACT.displayValue
						}
					}
				]
			};

			var doMoveAuditToArchive = function(result) {
				if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
					sandbox.publish('PushHistoryState', {
						hash: 'SysOperationAuditMovingToArchiveModule/'
					});
				} else {
					return;
				}
			};

			function searchInUtilsConfig(id, utilsConfig) {
				var result = false;
				Terrasoft.each(utilsConfig.items, function(item) {
					if (item.id === id) {
						result = item;
						return false;
					}
				});
				return result;
			}

			var loadCanManageSysAuditOperationsSection = function(scope) {
				RightUtilities.checkCanExecuteOperation({
					operation: 'CanManageSysOperationAudit'
				}, function(result) {
					scope.set("canManageSysAuditOperationsSection", result);
				}, scope);
			};

		};

		return structure;
	});