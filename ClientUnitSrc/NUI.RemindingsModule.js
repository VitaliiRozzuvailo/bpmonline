define('RemindingsModule', ['ext-base', 'terrasoft', 'sandbox', 'Reminding', 'RemindingsModuleResources',
	'ConfigurationConstants', 'profile!remindingsModuleKey', 'RemindingsUtilities', 'MaskHelper', 'VisaHelper',
	'css!VisaHelper'],
	function(Ext, Terrasoft, sandbox, Reminding, resources, ConfigurationConstants, profile, RemindingsUtilities,
		MaskHelper, VisaHelper) {
		var visaResources = VisaHelper.resources.localizableStrings;
		var renderContainer;
		/*********************************************************************************************************/
		/*       ViewModel                                                                                       */
		/********************************************************************************************************/
		var getViewModel = function() {
			var viewModelConfig = {
				entitySchema: Reminding,
				values: {
					remindingsGridData: new Terrasoft.BaseViewModelCollection(),
					emailsGridData: new Terrasoft.BaseViewModelCollection(),
					approvalsGridData: new Terrasoft.BaseViewModelCollection(),
					selectedGrid: '',
					remindingCount: 0,
					emailCount: 0,
					visaCount: 0,
					remindingLoaded: false,
					emailLoaded: false,
					visaLoaded: false,
					allLoaded: false,
					firstLoad: false,
					gridEmpty: false
				},
				rowConfig: [
					{
						type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
						name: 'activeRow',
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						visible: false
					},
					{
						type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
						name: 'currentCollection',
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						visible: true,
						isCollection: true
					},
					{
						type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
						name: 'selectedRows',
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						visible: false
					},
					{
						type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
						name: 'canLoadData',
						dataValueType: Terrasoft.DataValueType.BOOLEAN,
						visible: false
					}
				],
				methods: {
					getHeader: function() {
						return resources.localizableStrings.ModuleCaption;
					},
					loadCollections: function(instance) {
						if (instance && instance.isDestroyed) {
							return;
						}
						this.set('firstLoad', true);
						RemindingsUtilities.getRemindingsCounters(this, updateCountersButtons);
					},
					setAllLoaded: function() {
						this.set('allLoaded', true);
						this.set('firstLoad', false);
						RemindingsUtilities.getRemindingsCounters(this, updateCountersButtons);
						this.changeGridView();
					},
					loadApprovalsCollection: function(skip) {
						this.set('visaLoaded', false);
						var select = RemindingsUtilities.getVisaSelect();
						if (skip) {
							select.skipRowCount = skip;
						}
						select.getEntityCollection(function(response) {
							if (instance.isDestroyed) { return; }
							var reminding = this.get('approvalsGridData');
							if (!skip) {
								reminding.clear();
							}
							if (response && response.success) {
								var entities = response.collection;
								entities.each(function(item) {
									item.entitySchema = this.entitySchema;
									item.id = item.get('Id');
									item.currentLoadGrid = 'approvalsGridData';
									item.columns.goToLink = {
										dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
									};
									setLinks(item, this);
									item.scope = this;
								}, this);
								reminding.loadAll(entities);
							}
							RemindingsUtilities.getRemindingsCounters(this,
								updateCountersButtons);
							this.set('visaLoaded', true);
							this.setAllLoaded();
						}, this);
					},
					loadRemindingsCollection: function(skip) {
						this.set('remindingLoaded', false);
						var select = RemindingsUtilities.getRemindingSelect();
						if (skip) {
							select.skipRowCount = skip;
						}
						select.getEntityCollection(function(response) {
							if (instance.isDestroyed) { return; }
							var reminding = this.get('remindingsGridData');
							if (!skip) {
								reminding.clear();
							}
							if (response && response.success) {
								var entities = response.collection;
								entities.each(function(item) {
									item.entitySchema = this.entitySchema;
									item.id = item.get('Id');
									item.currentLoadGrid = 'remindingsGridData';
									item.columns.goToLink = {
										dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
									};
									var title = item.get('SubjectCaption');
									setLinks(item, this);
									var description = item.get('Description');
									if (description === title) {
										item.set('Description', '');
									}
									var schemaName = item.get('SchemaName');
									if (schemaName === 'Activity') {
										item.set('SysEntitySchema', null);
									}
									item.delay = function(menu) {
										var tagValue = menu[0];
										var model = this;
										var remindingId = model.get('Id');
										delayItem(remindingId,
											Ext.Date.add(new Date(Date.now()), Ext.Date.MINUTE,
												parseInt(tagValue, 0)),	model, function() {
												this.parentCollection.collection.removeAtKey(remindingId);
												RemindingsUtilities.getRemindingsCounters(this.scope,
													updateCountersButtons);
											});
									};
									item.scope = this;
								}, this);
								reminding.loadAll(entities);
							}
							this.set('remindingLoaded', true);
							this.setAllLoaded();
						}, this);
					},
					loadEmailsCollection: function(skip) {
						this.set('emailLoaded', false);
						var selectEmail = RemindingsUtilities.getEmailSelect();
						if (skip) {
							selectEmail.skipRowCount = skip;
						}
						selectEmail.getEntityCollection(function(response) {
							if (instance.isDestroyed) { return; }
							var emailGrid = this.get('emailsGridData');
							if (!skip) {
								emailGrid.clear();
							}
							var scope = this;
							if (response && response.success) {
								var entitiesEmail = response.collection;
								entitiesEmail.each(function(item) {
									item.columns.goToLink = {
										dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
									};
									item.columns.senderLink = {
										dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
									};

									item.entitySchema = this.entitySchema;
									item.id = item.get('Id');
									item.currentLoadGrid = 'emailsGridData';
									setLinks(item, this);
								}, scope);
								emailGrid.loadAll(entitiesEmail);
							}
							this.set('emailLoaded', true);
							this.setAllLoaded();
						}, this);
					},
					loadCurrentModuleCollections: function(type) {
						this.set('activeRow', null);
						switch (type) {
							case 'Email':
								this.set('currentCollection', this.get('emailsGridData'));
								this.loadEmailsCollection();
								break;
							case 'Reminding':
								this.set('currentCollection', this.get('remindingsGridData'));
								this.loadRemindingsCollection();
								break;
							case 'Visa':
								this.set('currentCollection', this.get('approvalsGridData'));
								this.loadApprovalsCollection();
								break;
							default:
								this.set('currentCollection', this.get('emailsGridData'));
								this.loadEmailsCollection();
								break;
						}
					},
					getPressedRemindingButton: function() {
						if (this.get('selectedGrid') === 'Reminding') {
							return true;
						}
						return false;
					},
					getPressedVisaButton: function() {
						if (this.get('selectedGrid') === 'Visa') {
							return true;
						}
						return false;
					},
					getPressedEmailButton: function() {
						if (this.get('selectedGrid') === 'Email') {
							return true;
						}
						return false;
					},
					loadNext: function() {
						var current = this.get('selectedGrid');
						var grid = this.get('currentCollection');
						var skip = grid.getItems().length;
						if (current === 'Reminding') {
							if (this.get('remindingCount') > skip) {
								this.loadRemindingsCollection(skip);
							}
						} else if (current === 'Email') {
							if (this.get('emailCount') > skip) {
								this.loadEmailsCollection(skip);
							}
						} else if (current === 'Visa') {
							if (this.get('visaCount') > skip) {
								this.loadApprovalsCollection(skip);
							}
						}
					},
					setSelected: function(eventName, modelMethod, model, params) {
						if (params) {
							var current = this.get('selectedGrid');
							if (current !== params) {
								setCurrentGrid(this, params);
								this.loadCurrentModuleCollections(params);
							}
						}
					},
					onActiveRowAction: function(tag, id) {
						var rowActionConfig = this.get('rowActionConfig');
						var handlerName = rowActionConfig[tag];
						if (this[handlerName]) {
							this[handlerName](id);
						}
					},
					getEntity: function(id) {
						var collection = this.get('currentCollection');
						return collection.get(id) || null;
					},
					getVisaEntityName: function(id) {
						var remindingEntity = this.getEntity(id);
						var schemaName = remindingEntity.get('VisaSchemaName');
						return schemaName + 'Visa';
					},
					approve: function(id) {
						var sc = this;
						var visaEntityName = this.getVisaEntityName(id);
						sandbox.requireModuleDescriptors(['force!' + visaEntityName], function() {
							require([visaEntityName], function(schema) {
								var select = Ext.create('Terrasoft.EntitySchemaQuery', {
									rootSchema: schema
								});
								select.addColumn('Id');
								select.addColumn('Status');
								select.addColumn('Comment');
								select.addColumn('SetDate');
								select.addColumn('SetBy');
								select.getEntity(id, function(result) {
									var entity = result.entity;
									var callback = function() {
										updateCurrentGrid(sc);
									};
									VisaHelper.approveAction(entity, callback, this);
								}, this);
							});
						});
					},
					reject: function(id) {
						var sc = this;
						var visaEntityName = this.getVisaEntityName(id);
						sandbox.requireModuleDescriptors(['force!' + visaEntityName], function() {
							require([visaEntityName], function(schema) {
								var select = Ext.create('Terrasoft.EntitySchemaQuery', {
									rootSchema: schema
								});
								select.addColumn('Id');
								select.addColumn('Status');
								select.addColumn('Comment');
								select.addColumn('SetDate');
								select.addColumn('SetBy');
								select.getEntity(id, function(result) {
									var entity = result.entity;
									var callback = function() {
										updateCurrentGrid(sc);
									};
									VisaHelper.rejectAction(entity, callback, this);
								}, this);
							});
						});
					},
					changeVizier: function(id) {
						var sc = this;
						var visaEntityName = this.getVisaEntityName(id);
						VisaHelper.changeVizierAction(id, visaEntityName, sandbox, renderContainer, function() {
							updateCurrentGrid(sc);
						}, this);
					},
					getVisaCaptionButton: function() {
						return getCaptionButton(resources.localizableStrings.VisaButtonCaption, this);
					},
					getRemindingCaptionButton: function() {
						return getCaptionButton(resources.localizableStrings.RemindingButtonCaption, this);
					},
					getEmailCaptionButton: function() {
						return getCaptionButton(resources.localizableStrings.EmailButtonCaption, this);
					},
					goto: function() {
						var currentGridCollection = this.get('currentCollection');
						var activeRowId = this.get('activeRow');
						var row = currentGridCollection.get(activeRowId);
						var link = row.get('linkEdit');
						sandbox.publish('PushHistoryState', { hash: link.url });
					},
					reply: function() {
						var currentGridCollection = this.get('currentCollection');
						var activeRowId = this.get('activeRow');
						var row = currentGridCollection.get(activeRowId);
						var linkReply = row.get('linkReply');
						sandbox.publish('PushHistoryState', { hash: linkReply.url });
					},
					replyAll: function() {
						var currentGridCollection = this.get('currentCollection');
						var activeRowId = this.get('activeRow');
						var row = currentGridCollection.get(activeRowId);
						var linkReplyAll = row.get('linkReplyAll');
						sandbox.publish('PushHistoryState', { hash: linkReplyAll.url });
					},
					forward: function() {
						var currentGridCollection = this.get('currentCollection');
						var activeRowId = this.get('activeRow');
						var row = currentGridCollection.get(activeRowId);
						var linkForward = row.get('linkForward');
						sandbox.publish('PushHistoryState', { hash: linkForward.url });
					},
					setReadEmail: function() {
						var activeRowId = this.get('activeRow');
						setReadEmailItem(activeRowId, this, updateCurrentGrid);
					},
					setReadEmailAll: function() {
						var currentGridCollection = this.get('currentCollection');
						var length = currentGridCollection.getCount();
						if (length <= 0) {
							return;
						}
						var emailCount = this.get('emailCount');
						var question = Ext.String.format(
							resources.localizableStrings.ReadAllEmailQuestion,
							emailCount);
						var scope = this;
						Terrasoft.utils.showConfirmation(question,
							function getSelectedButton(returnCode) {
								if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
									scope.set('allLoaded', false);
									var update = Ext.create('Terrasoft.UpdateQuery', {
										rootSchemaName: 'ActivityParticipant'
									});
									var filters = update.filters;
									var participantIdFilter = Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL,
										'Participant.Id', Terrasoft.SysValue.CURRENT_USER_CONTACT.value);
									filters.add('participantIdFilter', participantIdFilter);
									update.setParameterValue('ReadMark', true, Terrasoft.DataValueType.BOOLEAN);
									update.execute(function() {
										RemindingsUtilities.getCounters(scope, updateCounters);
									}, scope);
								}
							}, ['yes', 'no'], scope);
					},
					delayAll: function(menu) {
						var tagValue = menu[0];
						var model = this;
						var currentGridCollection = model.get('currentCollection');
						var length = currentGridCollection.getCount();
						if (length <= 0) {
							return;
						}
						var remindingCount = this.get('remindingCount');
						var question = Ext.String.format(
							resources.localizableStrings.DelayAllRemindQuestion,
							remindingCount);
						Terrasoft.utils.showConfirmation(question,
							function getSelectedButton(returnCode) {
								if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
									model.set('allLoaded', false);
									var update = Ext.create('Terrasoft.UpdateQuery', {
										rootSchemaName: 'Reminding'
									});
									update.filters = RemindingsUtilities.remindingFilters();
									update.setParameterValue('RemindTime', Ext.Date.add(new Date(Date.now()),
										Ext.Date.MINUTE, parseInt(tagValue, 0)),
										Terrasoft.DataValueType.DATE_TIME);
									update.execute(function(response) {
										if (response.success) {
											RemindingsUtilities.getRemindingsCounters(model, updateCounters);
										}
									}, model);
								}
							}, ['yes', 'no'], model);
					},
					deleteEmail: function() {
						var activeRowId = this.get('activeRow');
						deleteEmailItem(activeRowId, this, updateCurrentGrid);
					},
					cancel: function() {
						var activeRowId = this.get('activeRow');
						var currentSelectedGrid = this.get('selectedGrid');
						if (currentSelectedGrid === 'Reminding') {
							deleteRemindingItem(activeRowId, this, updateCurrentGrid);
						}
					},
					cancelAll: function() {
						var currentGridCollection = this.get('currentCollection');
						var length = currentGridCollection.getCount();
						if (length <= 0) {
							return;
						}
						var remindingCount = this.get('remindingCount');
						var question = Ext.String.format(
							resources.localizableStrings.CancelAllRemindingsQuestion,
							remindingCount);
						var scope = this;
						Terrasoft.utils.showConfirmation(question,
							function getSelectedButton(returnCode) {
								if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
									scope.set('allLoaded', false);
									var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
										rootSchemaName: 'Reminding'
									});
									deleteQuery.filters = RemindingsUtilities.remindingFilters();
									deleteQuery.execute(function(response) {
										if (response.success) {
											RemindingsUtilities.getRemindingsCounters(scope, updateCounters);
										}
									}, scope);
								}
							}, ['yes', 'no'], scope);

					}
				}
			};
			viewModelConfig.values.rowActionConfig = {
				'Cancel': 'cancel',
				GoTo: 'goto',
				Reply: 'reply',
				ReplyAll: 'replyAll',
				Forward: 'forward',
				Delete: 'deleteEmail',
				Read: 'setReadEmail',
				Approve: 'approve',
				Reject: 'reject',
				changeVizier: 'changeVizier'
			};
			return Ext.create('Terrasoft.BaseViewModel', viewModelConfig);
		};

		function init() {
			var state = sandbox.publish('GetHistoryState');
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish('ReplaceHistoryState', {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
			sandbox.subscribe('RemindingsCountsChanged', function(args) {
				var RemindingsCount = args.RemindingsCount;
				var EmailsCount = args.EmailsCount;
				var VisaCount = args.VisaCount;
				viewModel.set('remindingCount', RemindingsCount);
				viewModel.set('emailCount', EmailsCount);
				viewModel.set('visaCount', VisaCount);

				var curGrid = viewModel.get('selectedGrid');
				if (Ext.isEmpty(curGrid) || getGridCountByName(curGrid, viewModel) === 0) {
					updateCurrentGrid(viewModel);
				}
			});
		}

		function setCurrentGrid(scope, params) {
			scope.set('selectedGrid', params);
			if (params === 'Reminding') {
				scope.set('remindingVisible', true);
				scope.set('emailVisible', false);
				scope.set('visaVisible', false);
			} else if (params === 'Email') {
				scope.set('remindingVisible', false);
				scope.set('visaVisible', false);
				scope.set('emailVisible', true);
			} else if (params === 'Visa') {
				scope.set('remindingVisible', false);
				scope.set('emailVisible', false);
				scope.set('visaVisible', true);
			}

			var profileKey = 'remindingsModuleKey';
			var profile = scope.profile ? scope.profile : {};
			profile.currentGrid = params;
			Terrasoft.utils.saveUserProfile(profileKey, profile, false);
		}
		function getCurrentGrid(scope) {
			var currentGrid = scope.get('selectedGrid');
			if (!currentGrid || currentGrid === '') {
				currentGrid = 'Email';
			}
			if (profile && profile.currentGrid) {
				currentGrid = profile.currentGrid;
			}
			return currentGrid;
		}
		function getGridCountByName(name, model) {
			switch (name) {
				case 'Visa':
					return model.get('visaCount');
				case 'Reminding':
					return model.get('remindingCount');
				case 'Email':
					return model.get('emailCount');
			}
		}
		function updateCurrentGrid(scope) {
			if (scope) {
				var current = scope.get('selectedGrid');
				scope.loadCurrentModuleCollections(current);
			}
		}
		function setCounters(countersData, scope) {
			scope.set('remindingCount', countersData.remindingsCount);
			scope.set('emailCount', countersData.emailsCount);
			scope.set('visaCount', countersData.visaCount);
			/*var curGrid = scope.get('selectedGrid');
			if (Ext.isEmpty(curGrid) || getGridCountByName(curGrid, scope) === 0) {
				if (countersData.remindingCount === 0 &&
					countersData.emailCount === 0 && countersData.visaCount === 0) {
					return;
				}
				updateCurrentGrid(scope);
			}*/
		}

		function updateCounters(countersData) {
			if (instance.isDestroyed) {
				return;
			}
			setCounters(countersData, this);
			updateCurrentGrid(this);
		}

		function updateCountersButtons(countersData) {
			if (instance.isDestroyed) {
				return;
			}
			setCounters(countersData, this);
			sandbox.publish('ChangeRemindingsCounts', {});
			if (this.get('firstLoad')) {
				setCurrentGrid(this, getCurrentGrid(this));
				updateCurrentGrid(this);
			}
		}

		function additionalSetLink(item, config, scope) {
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: item.get('SchemaName')
			});
			select.isDistinct = true;
			select.addColumn('Id');
			select.addColumn(config.attribute);
			select.getEntity(item.get('SubjectId'), function(response) {
				if (instance.isDestroyed) {
					return;
				}
				if (Ext.isEmpty(response.entity)) {
					var sectionGridData = scope.get(item.currentLoadGrid);
					var sectionRow = sectionGridData.get(item.id);
					var sectionTitle = Ext.String.format(resources.localizableStrings.RemovedItemCaptionTemplate,
						sectionRow.get('SubjectCaption'));
					var sectionSchemaName = config.sectionSchema;
					var sectionToken = [config.sectionModule, sectionSchemaName];
					var sectionUrl = Terrasoft.workspaceBaseUrl + '/Nui/ViewModule.aspx#' + sectionToken.join('/');
					sectionRow.set('goToLink', {
						name: 'captionLink',
						title: sectionTitle,
						url: sectionUrl,
						target: '_self'
					});
					return;
				}
				var pageTypeId = response.entity.get(config.attribute);
				if (!Ext.isEmpty(pageTypeId)) {
					var pageObjects = config.pages.filter(
						function(page) { return (page.UId === pageTypeId.value); });
					if (!Ext.isEmpty(pageObjects) && !Ext.isEmpty(pageObjects[0])) {
						var cardSchemaName = config.cardSchema;
						var pageObject = pageObjects[0];
						var pageObjectCardSchema = pageObject.cardSchema;
						cardSchemaName = (!Ext.isEmpty(pageObjectCardSchema)) ?
							pageObjectCardSchema : cardSchemaName;
						var token = [config.cardModule, cardSchemaName, 'view', item.get('SubjectId')];
						var gridData = scope.get(item.currentLoadGrid);
						var row = gridData.get(item.id);
						var title = row.get('SubjectCaption');
						var url = Terrasoft.workspaceBaseUrl + '/Nui/ViewModule.aspx#' + token.join('/');
						row.set('goToLink', {
							name: 'captionLink',
							title: title,
							url: url,
							target: '_self'
						});
					}
				}
			}, scope);
		}
		function setSenderLink(item, scope) {
			var activityId = item.id;
			var select = RemindingsUtilities.getActivityParticipant(activityId);
			select.getEntityCollection(function(response) {
				if (instance.isDestroyed) { return; }
				if (response && response.success) {
					var entities = response.collection;
					if (entities.collection.length > 0) {
						var entity = entities.collection.items[0];
						var contactConfig = Terrasoft.configuration.ModuleStructure.Contact;
						var token = [contactConfig.cardModule, contactConfig.cardSchema,
							'view', entity.get('ContactId')];
						var url = Terrasoft.workspaceBaseUrl +
							'/Nui/ViewModule.aspx#' + token.join('/');
						item.set('senderLink', {
							name: 'senderLink',
							title: entity.get('ContactName'),
							url: url,
							target: '_self'
						});
					}

				}
			}, scope);

		}
		function setLinks(item, scope) {
			var currentType = item.currentLoadGrid;
			switch (currentType) {
				case 'remindingsGridData':
					var sysEntitySchemaName = item.get('SchemaName');
					var subjectId = item.get('SubjectId');
					var config = Terrasoft.configuration.ModuleStructure[sysEntitySchemaName];
					var cardSchemaName = config.cardSchema;
					var configAttribute = config.attribute;
					if (configAttribute) {
						additionalSetLink(item, config, scope);
					}
					var token = [config.cardModule, cardSchemaName, 'view', subjectId];
					var url = Terrasoft.workspaceBaseUrl + '/Nui/ViewModule.aspx#' + token.join('/');
					item.set('goToLink', {
						name: 'captionLink',
						title: '',
						url: url,
						target: '_self'
					});
					break;
				case 'emailsGridData':
					var emailId = item.get('Id');
					var emailSchemaName = 'Activity';
					var emailConfig = Terrasoft.configuration.ModuleStructure[emailSchemaName];
					var typeId = item.get(emailConfig.attribute);
					var linkEditURL = [emailConfig.cardModule, 'EmailPage', 'view', emailId];
					item.set('linkEdit', {
						name: 'captionLink',
						title: '',
						url: linkEditURL.join('/'),
						target: '_blank'
					});
					var goToLinkURL = Terrasoft.workspaceBaseUrl + '/Nui/ViewModule.aspx#' + linkEditURL.join('/');
					item.set('goToLink', {
						name: 'captionLink',
						title: '',
						url: goToLinkURL,
						target: '_self'
					});
					var linkAddURL = [emailConfig.cardModule, 'EmailPage', 'add',
						emailConfig.attribute, typeId.value];
					item.set('linkReply', {
						name: 'captionLink',
						title: '',
						url: linkAddURL.join('/') + '/Reply/' + emailId,
						target: '_blank'
					});
					item.set('linkReplyAll', {
						name: 'captionLink',
						title: '',
						url: linkAddURL.join('/') + '/ReplyAll/' + emailId,
						target: '_blank'
					});
					item.set('linkForward', {
						name: 'captionLink',
						title: '',
						url: linkAddURL.join('/') + '/Forward/' + emailId,
						target: '_blank'
					});
					setSenderLink(item, scope);
					break;
				case 'approvalsGridData':
					var visaObjectId = item.get('VisaObjectId');
					var visaSchemaName = item.get('VisaSchemaName');
					var visaSchemaTypeId = item.get('VisaSchemaTypeId');
					var pageName = getEditPage(visaSchemaName, visaSchemaTypeId);
					var approvalsLinkEditURL = ['CardModule', pageName, 'view', visaObjectId];
					item.set('linkEdit', {
						name: 'captionLink',
						title: '',
						url: approvalsLinkEditURL.join('/'),
						target: '_blank'
					});
					var approvalsGoToLinkURL = Terrasoft.workspaceBaseUrl +
						'/Nui/ViewModule.aspx#' +
						approvalsLinkEditURL.join('/');
					item.set('goToLink', {
						name: 'captionLink',
						title: '',
						url: approvalsGoToLinkURL,
						target: '_self'
					});
					break;
				default:
					break;
			}
		}
		function getEditPage(entitySchemaName, pageTypeId) {
			var config = Terrasoft.configuration.ModuleStructure[entitySchemaName];
			var cardSchemaName = (!config) ? (entitySchemaName + 'Page') : config.cardSchema;
			if (!Ext.isEmpty(pageTypeId)) {
				var pageObjects = config.pages.filter(
					function(item) {
						return (item.UId === pageTypeId);
					});
				if (!Ext.isEmpty(pageObjects) && !Ext.isEmpty(pageObjects[0])) {
					var pageObject = pageObjects[0];
					var pageObjectCardSchema = pageObject.cardSchema;
					cardSchemaName = (!Ext.isEmpty(pageObjectCardSchema)) ? pageObjectCardSchema : cardSchemaName;
				}
			}
			return cardSchemaName;
		}

		function deleteRemindingItem(activeRowId, scope, callback) {
			var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
				rootSchemaName: 'Reminding'
			});
			var filters = deleteQuery.filters;
			var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Id', activeRowId);
			filters.add('IdFilter', idFilter);
			var workspaceIdFilter = Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL,
				'SysEntitySchema.SysWorkspace.Id', Terrasoft.SysValue.CURRENT_WORKSPACE.value);
			filters.add('workspaceIdFilter', workspaceIdFilter);
			deleteQuery.execute(function(response) {
				if (response.success && callback) {
					callback.call(scope, scope, response);
				}
			}, scope);
		}
		function deleteEmailItem(activeRowId, scope, callback) {
			var buttonsConfig = {
				buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
					Terrasoft.MessageBoxButtons.NO.returnCode],
				defaultButton: 0
			};
			scope.showInformationDialog(resources.localizableStrings.DeleteEmailForUserQuestion,
				function(result) {
					if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
						var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
							rootSchemaName: 'Activity'
						});
						var filters = deleteQuery.filters;
						var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							'Id', activeRowId);
						filters.add('IdFilter', idFilter);
						deleteQuery.execute(function(response) {
							if (response.success && callback) {
								callback.call(scope, scope, response);
							}
						}, scope);
					}
				}, buttonsConfig, scope);
		}


		function setReadEmailItem(emailId, scope, callback) {
			var update = Ext.create('Terrasoft.UpdateQuery', {
				rootSchemaName: 'ActivityParticipant'
			});
			var filters = update.filters;
			var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Activity', emailId);
			filters.add('IdFilter', idFilter);
			var participantIdFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Participant.Id', Terrasoft.SysValue.CURRENT_USER_CONTACT.value);
			filters.add('participantIdFilter', participantIdFilter);
			update.setParameterValue('ReadMark', true, Terrasoft.DataValueType.BOOLEAN);
			update.execute(function(response) {
				if (response.success && callback) {
					callback.call(this, this, response);
				}
			}, scope);
		}

		function delayItem(remindingId, value, scope, callback) {
			var update = Ext.create('Terrasoft.UpdateQuery', {
				rootSchemaName: 'Reminding'
			});
			var filters = update.filters;
			var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'Id', remindingId);
			filters.add('IdFilter', idFilter);
			var workspaceIdFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				'SysEntitySchema.SysWorkspace.Id', Terrasoft.SysValue.CURRENT_WORKSPACE.value);
			filters.add('workspaceIdFilter', workspaceIdFilter);
			update.setParameterValue('RemindTime', value, Terrasoft.DataValueType.DATE_TIME);
			update.execute(function(response) {
				if (response.success && callback) {
					callback.call(this, this, response);
				}
			}, scope);
		}

		/*********************************************************************************************************/
		/*       View                                                                                            */
		/********************************************************************************************************/
		function getCaptionButton(caption, scope) {
			var length = 0;
			if (caption === resources.localizableStrings.RemindingButtonCaption) {
				length = scope.get('remindingCount');
			} else if (caption === resources.localizableStrings.EmailButtonCaption) {
				length = scope.get('emailCount');
			} else if (caption === resources.localizableStrings.VisaButtonCaption) {
				length = scope.get('visaCount');
			}
			return Ext.String.format(caption, length);
		}

		function getRemindingCustomButtonsConfig() {
			return [
				{
					id: 'general-items-delay-all-button',
					selectors: {
						wrapEl: '#general-items-delay-all-button'
					},
					caption: resources.localizableStrings.DelayAllButtonCaption,
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					margin: '0px 10px 0px 0px',
					tag: 'DelayAll',
					menu: {
						items: getDelayTimeMenuItems('delayAll')
					},
					enabled: {
						bindTo: 'remindingCount'
					},
					visible: {
						bindTo: 'remindingVisible'
					}
				},
				{
					id: 'general-items-cancel-all-button',
					selectors: {
						wrapEl: '#general-items-cancel-all-button'
					},
					caption: resources.localizableStrings.CancelAllButtonCaption,
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					margin: '0px 10px 0px 0px',
					tag: 'CancelAll',
					click: {
						bindTo: 'cancelAll'
					},
					enabled: {
						bindTo: 'remindingCount'
					},
					visible: {
						bindTo: 'remindingVisible'
					}
				}
			];
		}

		function getEmailCustomButtonsConfig() {
			return [
				{
					id: 'general-items-read-all-button',
					selectors: {
						wrapEl: '#general-items-read-all-button'
					},
					caption: resources.localizableStrings.ReadAllButtonCaption,
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					margin: '0px 10px 0px 0px',
					tag: 'ReadAll',
					click: {
						bindTo: 'setReadEmailAll'
					},
					enabled: {
						bindTo: 'emailCount'
					},
					visible: {
						bindTo: 'emailVisible'
					}
				}
			];
		}

		function getGeneralItemsCongif() {
			var generalItemsConfig = {
				className: 'Terrasoft.Container',
				id: 'general-items-container',
				selectors: {
					wrapEl: '#general-items-container'
				},
				items: [
					{
						id: 'general-items-email-button',
						selectors: {
							wrapEl: '#general-items-email-button'
						},
						caption: {
							bindTo: 'getEmailCaptionButton'
						},
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: ['open-button-wrapperEl'],
							markerClass: ['open-button-markerEl']
						},
						style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
						margin: '0px 10px 0px 0px',
						tag: 'Email',
						click: {
							bindTo: 'setSelected'
						},
						enabled: {
							bindTo: 'allLoaded'
						},
						groupName: 'generalGroup',
						pressed: {
							bindTo: 'getPressedEmailButton'
						}
					}, {
						id: 'general-items-reminding-button',
						selectors: {
							wrapEl: '#general-items-reminding-button'
						},
						caption: {
							bindTo: 'getRemindingCaptionButton'
						},
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: ['open-button-wrapperEl'],
							markerClass: ['open-button-markerEl']
						},
						style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
						margin: '0px 10px 0px 0px',
						tag: 'Reminding',
						click: {
							bindTo: 'setSelected'
						},
						enabled: {
							bindTo: 'allLoaded'
						},
						groupName: 'generalGroup',
						pressed: {
							bindTo: 'getPressedRemindingButton'
						}
					}, {
						id: 'general-items-visa-button',
						selectors: {
							wrapEl: '#general-items-visa-button'
						},
						caption: {
							bindTo: 'getVisaCaptionButton'
						},
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: ['open-button-wrapperEl'],
							markerClass: ['open-button-markerEl']
						},
						style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
						margin: '0px 10px 0px 0px',
						tag: 'Visa',
						visible: true,
						click: {
							bindTo: 'setSelected'
						},
						enabled: {
							bindTo: 'allLoaded'
						},
						groupName: 'generalGroup',
						pressed: {
							bindTo: 'getPressedVisaButton'
						}
					}
				]
			};

			var customButtons = getEmailCustomButtonsConfig();

			Terrasoft.each(customButtons, function(item) {
				generalItemsConfig.items.push(item);
			}, this);
			customButtons = getRemindingCustomButtonsConfig(viewModel);
			Terrasoft.each(customButtons, function(item) {
				generalItemsConfig.items.push(item);
			}, this);
			return generalItemsConfig;
		}

		function getDelayTimeMenuItems(bindToFunction) {
			return [{
				caption: resources.localizableStrings.MenuItem5MinCaption,
				tag: ['5'],
				click: {
					bindTo: bindToFunction
				}
			}, {
				caption: resources.localizableStrings.MenuItem10MinCaption,
				tag: ['10'],
				click: {
					bindTo: bindToFunction
				}
			}, {
				caption: resources.localizableStrings.MenuItem30MinCaption,
				tag: ['30'],
				click: {
					bindTo: bindToFunction
				}
			}, {
				caption: resources.localizableStrings.MenuItem1HourCaption,
				tag: ['60'],
				click: {
					bindTo: bindToFunction
				}
			}, {
				caption: resources.localizableStrings.MenuItem2HourCaption,
				tag: ['120'],
				click: {
					bindTo: bindToFunction
				}
			}, {
				caption: resources.localizableStrings.MenuItem1DayCaption,
				tag: ['1440'],
				click: {
					bindTo: bindToFunction
				}
			}
			];
		}

		function getGridConfig() {
			return {
				className: 'Terrasoft.Grid',
				type: 'tiled',
				multiSelect: false,
				watchRowInViewport: 2,
				collection: {
					bindTo: 'currentCollection'
				},
				activeRow: {
					bindTo: 'activeRow'
				},
				isEmpty: {
					bindTo: 'gridEmpty'
				},
				isLoading: {
					bindTo: 'gridLoading'
				},
				activeRowAction: {
					bindTo: 'onActiveRowAction'
				},
				selectedRows: {
					bindTo: 'selectedRows'
				},
				watchedRowInViewport: {
					bindTo: 'loadNext'
				}
			};
		}

		function getRemindingGridConfig(viewModel) {
			var gridConfig = getGridConfig();
			var remindingCount = viewModel.get('remindingCount');
			var remindingConfig = {
				isEmpty: remindingCount === 0,
				activeRowActions: [
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.DelayButtonCaption,
						tag: 'Delay',
						menu: {
							items: getDelayTimeMenuItems('delay')
						}
					},
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.CancelButtonCaption,
						tag: 'Cancel'
					}
				],
				columnsConfig: [
					[
						{
							cols: 20,
							link: {
								bindTo: 'goToLink'
							},
							key: [
								{
									type: 'title',
									name: {
										bindTo: 'SubjectCaption'
									}
								}
							]
						},
						{
							cols: 4,
							key: [
								{
									name: {
										bindTo: 'RemindTime'
									}
								}
							]
						}
					],
					[
						{
							cols: 24,
							key: [
								{
									name: {
										bindTo: 'Description'
									}
								}
							]
						}
					],
					[
						{
							cols: 24,
							key: [
								{
									name: {
										bindTo: 'SysEntitySchema'
									}
								}
							]
						}
					]
				]
			};
			Ext.apply(gridConfig, remindingConfig);
			return gridConfig;
		}

		function getEmailGridConfig(viewModel) {
			var gridConfig = getGridConfig();
			var emailCount = viewModel.get('emailCount');
			var emailConfig = {
				isEmpty: emailCount === 0,
				activeRowActions: [
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ReplyButtonCaption,
						tag: 'Reply'
					},
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ReplyAllButtonCaption,
						tag: 'ReplyAll'
					},
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ForwardButtonCaption,
						tag: 'Forward'
					},
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.DeleteButtonCaption,
						tag: 'Delete'
					},
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.ReadButtonCaption,
						tag: 'Read'
					}
				],
				columnsConfig: [
					[
						{
							cols: 20,
							link: {
								bindTo: 'goToLink'
							},
							key: [
								{
									name: resources.localizableStrings.TitleCellCaption,
									type: 'caption'
								},
								{
									type: 'title',
									name: {
										bindTo: 'Title'
									}
								}
							]
						},
						{
							cols: 4,
							key: [
								{
									name: resources.localizableStrings.StartDateCellCaption,
									type: 'caption'
								},
								{
									name: {
										bindTo: 'StartDate'
									}
								}
							]
						}
					],
					[
						{
							link: {
								bindTo: 'senderLink'
							},
							cols: 24,
							key: [
								{
									name: resources.localizableStrings.SenderCellCaption,
									type: 'caption'
								},
								{
									name: {
										bindTo: 'Sender'
									}
								}
							]
						}
					]
				]
			};
			Ext.apply(gridConfig, emailConfig);
			return gridConfig;
		}

		function getVisaGridConfig() {
			var gridConfig = getGridConfig();
			var visaCount = viewModel.get('visaCount');
			var visaGridConfig = {
				isEmpty: visaCount === 0,
				activeRowActions: [
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: visaResources.Approve,
						tag: 'Approve'
					}, {
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: visaResources.Reject,
						tag: 'Reject'
					}, {
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: visaResources.ChangeVisaOwner,
						tag: 'changeVizier'
					}
				],
				columnsConfig: [
					[{
						cols: 18,
						link: {bindTo: 'goToLink'},
						key: [
							{
								type: 'title',
								name: {
									bindTo: 'Title'
								}
							}
						]
					}, {
						cols: 6,
						key: [
							{
								type: 'caption',
								name: resources.localizableStrings.SetDate
							}, {
								type: 'text',
								name: {
									bindTo: 'CreatedOn'
								}
							}
						]
					}], [{
						cols: 24,
						key:  [
							{
								type: 'caption',
								name: resources.localizableStrings.Objective
							}, {
								type: 'text',
								name: {
									bindTo: 'Objective'
								}
							}
						]
					}]
				]
			};
			Ext.apply(gridConfig, visaGridConfig);
			return gridConfig;
		}

		function getCurrentGridConfig(viewModel) {
			var selectedGrid = viewModel.get('selectedGrid');
			switch (selectedGrid) {
				case 'Reminding':
					return getRemindingGridConfig(viewModel);
				case 'Email':
					return getEmailGridConfig(viewModel);
				case 'Visa':
					return getVisaGridConfig(viewModel);
				default:
					return getEmailGridConfig(viewModel);
			}
		}

		function getRightConfigContainer() {
			return Ext.create('Terrasoft.Container', {
				id: 'rightContainer',
				classes: {
					wrapClassName: [
						'right-container'
					]
				},
				selectors: {
					wrapEl: '#rightContainer'
				},
				items: []
			});
		}

		function getLeftConfigContainer() {
			return Ext.create('Terrasoft.Container', {
				id: 'leftContainer',
				classes: {
					wrapClassName: [
						'left-container'
					]
				},
				selectors: {
					wrapEl: '#leftContainer'
				},
				items: getGeneralItemsCongif()
			});
		}

		function generateMainView() {
			var leftConfigContainer = getLeftConfigContainer();
			var rightConfigContainer = getRightConfigContainer();
			return Ext.create('Terrasoft.Container', {
					id: 'topContainer',
					selectors: {
						wrapEl: '#topContainer'
					},
					items: [{
						className: 'Terrasoft.Container',
						id: 'headContainer',
						selectors: {
							wrapEl: '#headContainer'
						},
						classes: {
							wrapClassName: ['header']
						},
						items: [{
							className: 'Terrasoft.Container',
							id: 'header-name-container',
							selectors: {
								wrapEl: '#header-name-container'
							},
							classes: {
								wrapClassName: ['header-name-container']
							},
							items: [{
								className: 'Terrasoft.Label',
								caption: {
									bindTo: 'getHeader'
								}
							}]
						}, {
							className: 'Terrasoft.Container',
							id: 'module-command-line',
							selectors: {
								wrapEl: '#module-command-line'
							},
							classes: {
								wrapClassName: ['module-command-line']
							},
							items: []
						}, {
							className: 'Terrasoft.Container',
							id: 'module-help-container',
							selectors: {
								wrapEl: '#module-help-container'
							},
							classes: {
								wrapClassName: ['module-help-container']
							},
							items: []
						}]
					},
						leftConfigContainer,
						rightConfigContainer
					]
				}
			);
		}

		/*********************************************************************************************************/
		/*       Model                                                                                          */
		/********************************************************************************************************/

		var currentGrid;
		var viewModel;
		function changeGridView() {
			if (currentGrid) {
				currentGrid.destroy();
			}
			var itemViewConfig = getCurrentGridConfig(viewModel);
			currentGrid = Ext.create(itemViewConfig.className, itemViewConfig);
			currentGrid.bind(viewModel);
			var renderRight = Ext.get('rightContainer');
			currentGrid.render(renderRight);
		}

		function loadContextHelp(id) {
			if (instance.isDestoryed) { return; }
			sandbox.subscribe('GetContextHelpId', function() {
				return id;
			}, [id]);
			var contextHelpContainer = Ext.get('module-help-container');
			sandbox.loadModule('ContextHelpModule', {
				renderTo: contextHelpContainer,
				id: id
			});
		}
		function loadCommandLine() {
			var commandLineContainer = Ext.get('module-command-line');
			sandbox.loadModule('CommandLineModule', {
				renderTo: commandLineContainer
			});
		}
		function reRender() {
			viewConfig = generateMainView();
			viewConfig.bind(viewModel);
			viewConfig.render(renderContainer);
			changeGridView();
			loadCommandLine.call(viewModel);
			loadContextHelp('1011');
		}
		var viewConfig = {};
		var render = function(renderTo) {
			renderContainer = renderTo;
			if (instance.isDestroyed) { return; }
			if (viewModel) {
				reRender();
				return;
			}
			viewModel = getViewModel();

			viewModel.changeGridView = function() {
				changeGridView();
			};
			viewModel.loadCollections(this);
			viewConfig = generateMainView();
			viewConfig.bind(viewModel);
			viewConfig.render(renderTo);
			MaskHelper.HideBodyMask();
			loadCommandLine.call(viewModel);
			loadContextHelp('1011');
		};
		var instance = {
			init: init,
			render: render
		};
		return instance;
	}
);
