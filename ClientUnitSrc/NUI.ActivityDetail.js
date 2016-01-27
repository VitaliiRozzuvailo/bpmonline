define('ActivityDetail', ['Activity', 'sandbox', 'ActivityDetailStructure', 'ActivityDetailResources'],
	function(Activity, sandbox, structure, resources) {
		structure.userCode = function() {
			var entitySchema = this.entitySchema = Activity;
			this.name = 'ActivityDetailViewModel';
			this.editPageName = 'ActivityPage';
			this.typeColumn = "Type";

			this.utilsConfig = {
				hiddenAdd: true,
				useAdditionalAddButton: true
			};

			this.captionsConfig = [{
				cols: 12,
				name: resources.localizableStrings.TitleCaption
			}, {
				cols: 6,
				name: resources.localizableStrings.StartDateCaption
			}, {
				cols: 6,
				name: resources.localizableStrings.StatusCaption
			}];

			this.columnsConfig = [
				[
					{
						cols: 12,
						key: [
							{
								name: {
									bindTo: 'Title'
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
									bindTo: 'StartDate'
								}
							}
						]
					},
					{
						cols: 6,
						key: [
							{
								name: {
									bindTo: 'Status'
								}
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'Title'
				},
				{
					columnPath: 'StartDate'
				},
				{
					columnPath: 'Status'
				},
				{
					columnPath: 'Type'
				},
				{
					columnPath: 'ProcessElementId'
				}
			];

			var parentMethodEdit = this.methods.edit;
			this.methods.edit = function() {
				var selectedRows = this.GetSelectedItems();
				var recordId = selectedRows[0];
				var gridData = this.get('gridData');
				if (recordId && gridData && gridData.collection) {
					if (recordId) {
						var filteredSelectedRows = gridData.collection.items.filter(function(item) {
								return (item.values.Id === recordId);
							});
						if (filteredSelectedRows && filteredSelectedRows.length > 0) {
							var procElId = filteredSelectedRows[0].values.ProcessElementId;
							if (procElId && !Terrasoft.isEmptyGUID(procElId)) {
								sandbox.publish('ProcessExecDataChanged',
									{
										procElUId: procElId,
										recordId: recordId,
										scope: this,
										parentMethodArguments: null,
										parentMethod: parentMethodEdit
									});
								return;
							}
						}
					}
				}
				if (!Ext.isEmpty(parentMethodEdit)) {
					parentMethodEdit.call(this);
				}
			};
			var parentApplyFilter = this.methods.applyFilter;
			this.methods.applyFilter = function(select, args) {
				var filterPath = this.filterPath;
				var filterValue = this.filterValue;
				if (args) {
					filterPath = this.filterPath = args.filterPath;
					filterValue = this.filterValue = args.filterValue;
				}
				if (args.filterPath === 'Participant') {
					select.filters.add('participiantdetailFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						'[ActivityParticipant:Activity].Participant.Id', args.filterValue));
					return false;
				}
				else {
					parentApplyFilter.apply(this, arguments);
					return true;
				}
			};

			var parentAdd = this.methods.add;
			this.methods.add = function(tag) {
				parentAdd.call(this, tag, function() {
					var viewModel = this;
					var recordId = this.filterValue;
					var filterPath = this.filterPath;
					var config = Terrasoft.configuration.ModuleStructure[this.entitySchema.name];
					var tagUId = tag.UId || tag;
					var editPageName = this.getEditPage(config, tagUId);
					sandbox = this.sandbox;
					var cardModuleId = sandbox.id + '_CardModule_' + this.entitySchema.name;
					sandbox.subscribe('CardModuleEntityInfo', function() {
						var entityInfo = {};
						entityInfo.action = 'add';
						entityInfo.cardSchemaName = editPageName;
						entityInfo.activeRow = '';
						if (config && config.attribute) {
							entityInfo.typeUId = tag.UId;
							entityInfo.typeColumnName = config.attribute;
						}
						entityInfo.valuePairs = [];
						if (tag && tag.additionalValues) {
							entityInfo.valuePairs = tag.additionalValues;
						}
						if (filterPath !== 'Participant') {
							entityInfo.valuePairs.push(
								{
									name: filterPath,
									value: recordId
								});
						} else {
							entityInfo.valuePairs.push(
								{
									name: 'Contact',
									value: recordId
								});
						}
						return entityInfo;
					}, [cardModuleId]);
					sandbox.publish('OpenCardModule', cardModuleId, [this.getCardModuleSandboxId()]);
					sandbox.subscribe('UpdateDetail', function(recordId) {
						viewModel.isObsolete = true;
						sandbox.publish('DetailChanged', [sandbox.id, recordId]);
					}, [cardModuleId]);
				});
			};

			this.methods.modifyView = function(viewConfig) {
				var config = Terrasoft.configuration.ModuleStructure[entitySchema.name];
				var menuItems = [];
				if (config && config.pages) {
					Terrasoft.each(config.pages, function(page) {
						var item = {
							caption: page.caption,
							tag: page,
							click: {
								bindTo: page.bindTo || 'add'
							}
						};
						if (page.enabled) {
							item.enabled = page.enabled;
						}
						menuItems.push(item);
					}, this);
				}
				var addButton = viewConfig.items[0].items[1];
				if (addButton.hasOwnProperty("click")) {
					delete addButton.click;
				}
				addButton.menu = {
					items: menuItems
				};
			};

		};
		return structure;
	});