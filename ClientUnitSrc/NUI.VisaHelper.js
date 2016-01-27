define('VisaHelper', ['terrasoft', 'VisaHelperResources', 'ConfigurationConstants',
	'LookupUtilities', 'sandbox', 'RightUtilities', 'ProcessModuleUtilities', 'MaskHelper'],
	function(Terrasoft, resources, ConfigurationConstants, LookupUtilities, sandbox, RightUtilities,
		ProcessModuleUtilities, MaskHelper) {


		var sendToVisaMenuItem = {
			caption: resources.localizableStrings.SendToVisaCaption,
			methodName: 'sendToVisa'
		};
		var sendToVisaMethod = function() {
			var entity = this.get("Id") || this.getActiveRow();
			entity = Ext.isObject(entity) ? entity.get("Id") : entity;
			var schemaName = this.entitySchema.name;
			RightUtilities.checkCanEdit({
				schemaName: schemaName,
				primaryColumnValue: entity,
				isNew: false
			}, function(result) {
				if (Ext.isEmpty(result)) {
					getSendToVisaProcces(schemaName, function(processUId) {
						var recordId = getProcessRecordId(this);
						ProcessModuleUtilities.executeProcess({
							sysProcessId: processUId,
							parameters: {
								RecordId: recordId
							}
						});
					}, this);
				} else {
					this.showInformationDialog(result);
					return;
				}
			}, this);
		};
		var getProcessRecordId = function(viewModel) {
            var activeRow = viewModel.get('ActiveRow') || viewModel.get('activeRow');
            var selectedRows = viewModel.get('SelectedRows') || viewModel.get('selectedRows');
			var recordId = viewModel.get(viewModel.entitySchema.primaryColumnName);
			return recordId || activeRow || (!Ext.isEmpty(selectedRows) ? selectedRows[0] : Terrasoft.GUID_EMPTY);
		};
		var getSendToVisaProcces = function(schemaName, callback, scope) {
			var sysSettingName = schemaName + 'VisaProcess';
			Terrasoft.SysSettings.querySysSettings([sysSettingName], function(result) {
				var processId = result[sysSettingName];
				if (Ext.isEmpty(processId)) {
					scope.showInformationDialog(resources.localizableStrings.SendToVisaSysSettingNotExistsError);
					return;
				}
				var processIdValue = Ext.isObject(processId) ? processId.value : processId;
				callback.call(scope, processIdValue);
			}, this);
		};

		var approveStatus = ConfigurationConstants.VisaStatus.positive;
		var rejectStatus = ConfigurationConstants.VisaStatus.negative;
		var MAX_COMMENT_LENGTH = 250;
		function reject(entity, comment, callback) {
			setStatus(entity, rejectStatus, comment, callback, this);
		}

		function approve(entity, comment, callback) {
			setStatus(entity, approveStatus, comment, callback, this);
		}

		function setStatus(entity, status, comment, callback, scope) {
			var update = Ext.create("Terrasoft.UpdateQuery", {
				rootSchema: entity.entitySchema
			});
			var updateObject = {
				Status: status,
				Comment: comment,
				SetDate: new Date(),
				SetBy: Terrasoft.SysValue.CURRENT_USER_CONTACT
			};
			for (var columnValue in updateObject) {
				update.setParameterValue(columnValue, updateObject[columnValue]);
			}
			var itemId = entity.get(entity.entitySchema.primaryColumn.name);
			update.enablePrimaryColumnFilter(itemId);
			update.execute(function(result) {
				callback.call(this, result, updateObject);
			}, scope || this);
		}
		function updateVizier(entity, visaOwner, callback, scope) {
			MaskHelper.ShowBodyMask();
			var delegatedFrom = entity.get('DelegatedFrom');
			var prevVisaOwner = entity.get('VisaOwner');
			var updateObject = {
				DelegatedFrom: delegatedFrom || prevVisaOwner,
				VisaOwner: visaOwner
			};
			for (var columnValue in updateObject) {
				entity.set(columnValue, updateObject[columnValue]);
			}
			entity.saveEntity(function(responce) {
				MaskHelper.HideBodyMask();
				callback.call(scope, responce, updateObject);
			}, this);
		}
		function prepareComment(comment) {
			if (comment && comment.length > MAX_COMMENT_LENGTH) {
				comment = comment.substring(0, MAX_COMMENT_LENGTH);
			}
			return comment;
		}

		function baseAction(caption, buttonCaption, entity, action, callback, scope) {
			var checkRightCallback = function() {
				Terrasoft.utils.inputBox(caption, function(result, arg) {
						if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
							var comment = prepareComment(arg.name.value);
							action.apply(scope || this, [entity, comment, callback]);
						}
					}, [{
						className: 'Terrasoft.Button',
						caption: buttonCaption,
						returnCode: 'yes'
					}, 'cancel'], this,
					{
						name: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							caption: resources.localizableStrings.Comments,
							customConfig: {
								className: 'Terrasoft.MemoEdit',
								height: '77px'
							}
						}
					},
					{
						defaultButton: 0,
						style:  {
							borderStyle: 'ts-messagebox-border-style-blue ts-messagebox-border-no-header',
							buttonStyle: 'blue'
						}
					}
				);
			};
			var itemId = entity.get(entity.entitySchema.primaryColumn.name);
			var schemaName = entity.entitySchema.name;
			checkRight(itemId, schemaName, checkRightCallback, scope);
		}

		function approveAction(entity, callback, scope) {
			var caption = resources.localizableStrings.WarningBeforeApprove;
			var buttonCaption = resources.localizableStrings.ApproveButtonCaption;

			baseAction(caption, buttonCaption, entity, approve, callback, scope);
		}

		function rejectAction(entity, callback, scope) {
			var caption = resources.localizableStrings.WarningBeforeRejecting;
			var buttonCaption = resources.localizableStrings.RejectButtonAction;
			baseAction(caption, buttonCaption, entity, reject, callback, scope);
		}

		function changeVizierAction(selectedItem, filterPath, sandbox, renderTo, callback, scope) {
			var lookupUtilitiesCallback = function(result) {
				if (result) {
					sandbox.requireModuleDescriptors(['force!' + filterPath], function() {
						require([filterPath], function(schema) {
							var newVisaOwner = result.selectedRows.getByIndex(0);
							var select = Ext.create('Terrasoft.EntitySchemaQuery', {
								rootSchema: schema
							});
							select.addColumn('Id');
							select.addColumn('VisaOwner');
							select.addColumn('DelegatedFrom');
							select.getEntity(selectedItem, function(result) {
								if (!result.success) {
									//info
									return;
								}
								var entity = result.entity;
								Terrasoft.each(entity.columns, function(column) {
									column.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
								}, this);

								updateVizier(entity, newVisaOwner, callback, scope);
							}, this);
						});
					});
				}
			};
			var checkRightCallback = function(result) {
				if (result) {
					var lookUpConfig = {
						entitySchemaName: 'SysAdminUnit',
						captionLookup: resources.localizableStrings.VisaLookupCaption
					};
					LookupUtilities.Open(sandbox, lookUpConfig, lookupUtilitiesCallback, this,
						renderTo || Ext.get('centerPanel'));
				}
			};
			var checkIsAllowedToDelegateCallback = function(result) {
				if (result) {
					checkRight(selectedItem, filterPath, checkRightCallback, this);
				}
			};
			checkIsAllowedToDelegate(selectedItem, filterPath, checkIsAllowedToDelegateCallback, scope);
		}

		function checkIsAllowedToDelegate(selectedItem, filterPath, callback, scope) {
			if (!selectedItem) {
				return;
			}
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: filterPath
			});

			select.addColumn('IsAllowedToDelegate');
			select.addColumn('DelegatedFrom');
			select.addColumn('VisaOwner');
			var isAllowedToDelegateFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'IsAllowedToDelegate', true);
			var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Id', selectedItem);
			select.filters.addItem(isAllowedToDelegateFilter);
			select.filters.addItem(idFilter);
			var filtersOrGroup = Ext.create('Terrasoft.FilterGroup');
			filtersOrGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
			var filters1 = Ext.create('Terrasoft.FilterGroup');
			filters1.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'[SysAdminUnitInRole:SysAdminUnitRoleId:DelegatedFrom].SysAdminUnit',
				Terrasoft.SysValue.CURRENT_USER.value));
			filters1.addItem(Terrasoft.createColumnIsNotNullFilter('DelegatedFrom'));
			var filters2 = Ext.create('Terrasoft.FilterGroup');
			filters2.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'[SysAdminUnitInRole:SysAdminUnitRoleId:VisaOwner].SysAdminUnit',
				Terrasoft.SysValue.CURRENT_USER.value));
			filters2.addItem(Terrasoft.createColumnIsNullFilter('DelegatedFrom'));
			filtersOrGroup.addItem(filters1);
			filtersOrGroup.addItem(filters2);
			select.filters.addItem(filtersOrGroup);
			select.getEntityCollection(function(response) {
				var collection = response.collection;
				if (response.success && collection && collection.getCount() > 0) {
					callback.apply(this, arguments);
				} else {
					showDelegateError.call(this, filterPath, selectedItem);
				}
			}, scope);

		}
		function showDelegateError(filterPath, selectedItem) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: filterPath
			});
			select.addColumn('Id');
			select.addColumn('IsAllowedToDelegate');
			select.getEntity(selectedItem, function(responce) {
				if (responce.success && responce.entity) {
					var isAllowedToDelegate = responce.entity.get('IsAllowedToDelegate');
					if (isAllowedToDelegate) {
						this.showInformationDialog(resources.localizableStrings.NotAllowedDelegateCurrentUserError);
						return;
					}
				}
				this.showInformationDialog(resources.localizableStrings.IsAllowedToDelegate);
			}, this);
		}

		function checkRight(selectedItem, schemaName, callback, scope) {
			RightUtilities.checkCanEdit({
				schemaName: schemaName,
				primaryColumnValue: selectedItem,
				isNew: false
			}, function(result) {
				if (result) {
					scope.showInformationDialog(resources.localizableStrings.NotRigth);
				} else {
					callback.call(scope, {
						success: true
					});
				}
			});
		}

		function openLookup(sandbox, viewModel) {

			var lookUpConfig = {
				entitySchemaName: 'SysAdminUnit'
			};
			LookupUtilities.ThrowOpenLookupMessage(sandbox, lookUpConfig, viewModel.addCallBack, viewModel,
				viewModel.getCardModuleSandboxId());
		}


		return {
			resources: resources,
			approve: approve,
			reject: reject,
			approveAction: approveAction,
			rejectAction: rejectAction,
			changeVizierAction: changeVizierAction,
//			checkCanBeChanged: checkChangedColumn,
			checkRight: checkRight,
			openLookup: openLookup,
			SendToVisaMenuItem: sendToVisaMenuItem,
			SendToVisaMethod: sendToVisaMethod,
			VisaLookupCaption: resources.localizableStrings.VisaLookupCaption
		};
	});