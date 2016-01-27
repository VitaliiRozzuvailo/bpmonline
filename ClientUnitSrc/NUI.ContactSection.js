define('ContactSection', ['Contact', 'ContactSectionStructure', 'sandbox', 'ContactSectionResources', 'MaskHelper'],
	function(Contact, structure, sandbox, resources, MaskHelper) {
	structure.userCode = function() {
		this.entitySchema = Contact;
		this.contextHelpId = '1002';
		this.name = 'ContactSectionViewModel';
		this.sysSettings = ['BuildType'];
		var uniqueMapsId = Terrasoft.generateGUID();
		this.columnsConfig = [[{
				cols: 24,
				key: [{
					name: { bindTo: 'Name' },
					type: 'title'
				}]
			}], [{
				cols: 12,
				key: [{
					name: { bindTo: 'Account' }
				}, {
					name: { bindTo: 'Job' }
				}]
			}]
		];
		this.loadedColumns = [{
			columnPath: 'Name'
		}, {
			columnPath: 'Account'
		}, {
			columnPath: 'Job'
		}];
		this.actions = getActions();
		this.methods.esqConfig = {
			sort: {
				columns: [{
					name: 'CreatedOn',
					orderPosition: 0,
					orderDirection: Terrasoft.OrderDirection.DESC
				}]
			}
		};
		this.methods.openDuplicatesModule = function() {
			MaskHelper.ShowBodyMask();
			sandbox.publish('PushHistoryState', { hash: 'DuplicatesModule/Contact'});
		};
		this.methods.openShowOnMap = function() {
			MaskHelper.ShowBodyMask();
			var items = this.getSelectedItems();
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Contact'
			});
			select.addColumn('Id');
			select.addColumn('Name');
			select.addColumn('Address');
			select.addColumn('City');
			select.addColumn('Region');
			select.addColumn('Country');
			select.addColumn('GPSN');
			select.addColumn('GPSE');
			select.filters.add('ContactIdFilter', Terrasoft.createColumnInFilterWithParameters('Id', items));
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
								schemaName: 'Contact',
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
					});
				}
			}, this);
		};
		this.methods.isGridRowsSelected = function() {
			var selectedRows = this.getSelectedItems();
			return !Ext.isEmpty(selectedRows) && selectedRows.length === 1 ? true : false;
		};
		this.methods.isGridManyRowsSelected = function() {
			var selectedRows = this.getSelectedItems();
			return !Ext.isEmpty(selectedRows) && selectedRows.length >= 0 ? true : false;
		};
		this.methods.fillContactWithSocialNetworksData = function() {
			MaskHelper.ShowBodyMask();
			var activeRowId = this.get('activeRow');

			var confirmationMessage = resources.localizableStrings.OpenContactCardQuestion;
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Contact'
			});
			MaskHelper.HideBodyMask();
			select.addColumn('FacebookId');
			select.addColumn('LinkedInId');
			select.addColumn('TwitterId');
			var filters = Ext.create('Terrasoft.FilterGroup');
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Id', activeRowId));
			select.filters = filters;
			select.getEntityCollection(function(result) {
				var collection = result.collection;
				if (!Ext.isEmpty(collection)) {
					var facebookId = collection.collection.items[0].values.FacebookId;
					var linkedInId = collection.collection.items[0].values.LinkedInId;
					var twitterId = collection.collection.items[0].values.TwitterId;
					if (facebookId !== '' || linkedInId !== '' || twitterId !== '') {
						sandbox.publish('PushHistoryState', { hash: 'FillContactWithSocialAccountDataModule',
							stateObj: {
								FacebookId: facebookId,
								LinkedInId: linkedInId,
								TwitterId: twitterId,
								ContactId: activeRowId
							}});
					} else {
						Terrasoft.utils.showConfirmation(confirmationMessage, function getSelectedButton(returnCode) {
							if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
								this.edit(activeRowId);
							}
						}, ['yes', 'no'], this);
					}
				}
			}, this);
		};
		this.methods.synchronizeWithGoogleContacts = function() {
			MaskHelper.ShowBodyMask();
			if (this.entitySchema.name !== 'Contact') {
				return;
			}
			Terrasoft.SysSettings.querySysSettingsItem('GoogleContactGroup', function(value) {
				if (!value) {
					this.showInformationDialog(resources.localizableStrings.FolderNotSet);
					MaskHelper.HideBodyMask();
					return;
				}
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'ContactFolder'
				});
				select.addColumn('Id');
				var filters = Ext.create('Terrasoft.FilterGroup');
				filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'Id', value));
				select.filters = filters;
				select.getEntityCollection(function(result) {
					var collection = result.collection;
					if (Ext.isEmpty(collection) || (collection.collection.getCount() === 0)) {
						this.showInformationDialog(resources.localizableStrings.FolderNotSet);
						MaskHelper.HideBodyMask();
						return;
					}
					var requestUrl = Terrasoft.workspaceBaseUrl + '/ServiceModel/ProcessEngineService.svc/' +
						'SynchronizeContactsWithGoogleModuleProcess/Execute?ResultParameterName=SyncResult';
					Ext.Ajax.request({
						url: requestUrl,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						method: 'POST',
						scope: this,
						callback: function(request, success, response) {
							var messageFail;
                            if (success) {
                                var responseValue = Ext.isIE8 || Ext.isIE9 ?
                                    response.responseXML.firstChild.text :
                                    response.responseXML.firstChild.textContent;
                                var responseData = Ext.decode(Ext.decode(responseValue));
                                if (Ext.isEmpty(responseData)) {
                                    messageFail = resources.localizableStrings.SyncProcessFail;
                                } else if (responseData.addedRecordsInBPMonlineCount) {
                                    this.clear();
                                    this.load();
                                    var message = resources.localizableStrings.SynchronizeWithGoogleSyncResult;
                                    var messageArr = message.split('{NewLine}');
                                    message = messageArr.join('\n');
                                    message = Ext.String.format(
                                        message,
                                        responseData.addedRecordsInBPMonlineCount, responseData.updatedRecordsInBPMonlineCount,
                                        responseData.deletedRecordsInBPMonlineCount, responseData.addedRecordsInGoogleCount,
                                        responseData.updatedRecordsInGoogleCount, responseData.deletedRecordsInGoogleCount);
                                    Terrasoft.utils.showInformation(message, null, null, {buttons: ['ok']});
                                } else if (responseData.settingsNotSet) {
                                    messageFail = resources.localizableStrings.SettingsNotSet;
                                } else if (responseData.AuthenticationErrorMessage) {
                                    messageFail = responseData.AuthenticationErrorMessage;
                                } else {
                                    messageFail = resources.localizableStrings.SyncProcessFail;
                                }
                            } else if (response.timedout) {
                                messageFail = resources.localizableStrings.SyncProcessTimedOut;
                            } else {
                                messageFail = resources.localizableStrings.CallbackFailed;
                            }
							MaskHelper.HideBodyMask();
							if (messageFail) {
								Terrasoft.utils.showInformation(messageFail, null, null, { buttons: ['ok'] });
							}
						}
					});
				}, this);
			}, this);
		};
		this.methods.openGoogleSettingsPage = function() {
			sandbox.publish('PushHistoryState', {
				hash: 'GoogleIntegrationSettingsModule/',
				stateObj: { schema: 'Contact' }
			});
		};
	};
	function getActions() {
		var actions = [];
		actions.push({
			caption: '',
			className: 'Terrasoft.MenuSeparator'
		}, {
			caption: resources.localizableStrings.DuplicatesAction,
			methodName: 'openDuplicatesModule'
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
				caption: resources.localizableStrings.SynchronizeWithGoogleContactsAction,
				methodName: 'synchronizeWithGoogleContacts'
			}, {
				caption: resources.localizableStrings.OpenGoogleSettingsPage,
				methodName: 'openGoogleSettingsPage'
			}, {
				caption: resources.localizableStrings.FillContactWithSocialNetworksDataAction,
				methodName: 'fillContactWithSocialNetworksData',
				enabled: {
					bindTo: 'isGridRowsSelected'
				}
			});
		}
		return actions;
	}
	return structure;
});
