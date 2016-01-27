define('ContactCareerDetail', ['terrasoft', 'ContactCareer', 'ContactCareerDetailStructure',
	'ContactCareerDetailResources'],
	function(Terrasoft, ContactCareer, structure, resources) {
		structure.userCode = function() {
			this.name = 'ContactCareerDetailViewModel';
			var contactColumnsConfig = [
				[{
					cols: 24,
					key: [{
						name: {
							bindTo: 'Account'
						},
						type: 'title'
					}]
				}], [{
						cols: 12,
						key: [{
							name: {
								bindTo: 'Job'
							}
						}]
					}, {
						cols: 6,
						key: [{
							name: {
								bindTo: 'Current'
							}
						}]
					}, {
						cols: 6,
						key: [{
							name: {
								bindTo: 'Primary'
							}
						}]
					}]
				];
			var contactLoadedColumns = [
				{
					columnPath: 'Account'
				}, {
					columnPath: 'Job'
				}, {
					columnPath: 'Current'
				}, {
					columnPath: 'Primary'
				}
			];
			var accountColumnsConfig = [[
				{
					cols: 12,
					key: [{
						name: {
							bindTo: 'Contact'
						},
						type: 'title'
					}]
				}, {
					cols: 6,
					key: [{
						name: {
							bindTo: 'Contact.Phone'
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: {
							bindTo: 'Contact.Email'
						}
					}]
				}
			], [
				{
					cols: 12,
					key: [{
						name: {
							bindTo: 'Job'
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: {
							bindTo: 'Department'
						}
					}]
				}, {
					cols: 6,
					key: [{
						name: {
							bindTo: 'Current'
						}
					}]
				}
			]];
			var accountLoadedColumns = [
				{
					columnPath: 'Contact'
				}, {
					columnPath: 'Contact.Phone'/*,
					dataValueType: Terrasoft.DataValueType.TEXT*/
				}, {
					columnPath: 'Contact.Email'
				}, {
					columnPath: 'Job'
				}, {
					columnPath: 'Department'
				}, {
					columnPath: 'Current'
				}
			];

			switch (this.filterPath) {
				case 'Contact':
					this.columnsConfig = contactColumnsConfig;
					this.loadedColumns = contactLoadedColumns;
					this.editPageName = 'ContactCareerPageInContact';
					break;
				case 'Account':
					this.columnsConfig = accountColumnsConfig;
					this.loadedColumns = accountLoadedColumns;
					this.editPageName = 'ContactCareerPageInAccount';
					this.editPages = [
						{
							caption: resources.localizableStrings.AddContact,
							name: 'AddContact',
							UId: '',
							bindTo: 'addAddContact'
						}, {
							caption: resources.localizableStrings.LinkToContact,
							name: 'LinkToContact',
							UId: '',
							bindTo: 'addLinkToContact'
						}
					];
					break;
			}

			this.entitySchema = ContactCareer;

			this.methods.addAddContact = function() {
				/*var navigationItems = [
					'CardModule',
					'ContactPage',
					'add',
					this.filterPath,
					this.filterValue
				];
				this.add(null, navigationItems.join('/'));*/
				addChaine('ContactPage', this);
			};
			this.methods.addLinkToContact = function() {
				/*var navigationItems = [
					'CardModule',
					'ContactCareerPageInAccount',
					'add',
					this.filterPath,
					this.filterValue
				];
				this.add(null, navigationItems.join('/'));*/

				addChaine('ContactCareerPageInAccount', this);
			};
			var addChaine = function(cardName, scope) {
				var accountObj = {
					name: scope.filterPath,
					value: scope.filterValue
				};
				var sandbox = scope.sandbox;
				var cardModuleId = sandbox.id + '_CardModule_' + cardName;
				var addDetail = function() {
					sandbox.subscribe('CardModuleEntityInfo', function(args) {
						var entityInfo = {};
						entityInfo.action = 'add';
						entityInfo.cardSchemaName = cardName;
						entityInfo.activeRow = '';
						entityInfo.valuePairs = [];
						entityInfo.valuePairs.push(accountObj);
						return entityInfo;
					}, [cardModuleId]);
					sandbox.publish('OpenCardModule', cardModuleId, [scope.getCardModuleSandboxId()]);
					sandbox.subscribe('UpdateDetail', function() {
						scope.isObsolete = true;
					}, [cardModuleId]);
				};
				var customAction;
				var isNewRecord = scope.args.operationType === 'add' || scope.args.operationType === 'copy';
				if (isNewRecord) {
					var historyState = sandbox.publish('GetHistoryState');
					var sandboxId = historyState.state.moduleId;
					var tag = null;
					var args = {
						callback: addDetail,
						tag: tag,
						scope: scope,
						escope: scope,
						customAction: customAction,
						moduleId: Ext.isEmpty(sandboxId) ? sandbox.id : sandboxId
					};
					sandbox.publish('SaveRecord', args);
				} else {
					addDetail();
				}
			};
			this.methods.gridRecolor = function() {
				var gridData = this.get('gridData');
				var items = gridData.getItems();
				var loadedObject = {};
				Terrasoft.each(items, function(item) {
					item.customStyle = null;
					if (!item.values.Current) {
						item.customStyle = { 'color': 'gray'};
					}
					var primaryValue = item.get(item.primaryColumnName);
					loadedObject[primaryValue] = item;
				}, this);
				gridData.clear();
				gridData.loadAll(loadedObject);
			};
			var baseonLoad = this.methods.onLoadData;
			this.methods.onLoadData = function(responce) {
				baseonLoad.call(this, responce);
				this.gridRecolor();

			};

		};
		return structure;
	});
