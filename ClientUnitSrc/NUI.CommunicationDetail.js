define('CommunicationDetail', ['sandbox', 'ext-base', 'terrasoft', 'ContactCommunication', 'AccountCommunication',
		'ConfigurationConstants', 'CommunicationDetailStructure', 'CommunicationDetailResources', 'LookupUtilities',
		'ServiceHelper', 'EmailHelper'], function(sandbox, Ext, Terrasoft, ContactCommunication, AccountCommunication,
		ConfigurationConstants, structure, resources, LookupUtilities, ServiceHelper, EmailHelper) {

	var facebookId = ConfigurationConstants.CommunicationTypes.Facebook;
	var linkedInId = ConfigurationConstants.CommunicationTypes.LinkedIn;
	var googleId = ConfigurationConstants.CommunicationTypes.Google;
	var twitterId = ConfigurationConstants.CommunicationTypes.Twitter;
	var filterSchemaName;

	var getIsSocialNetwork = function(value) {
		return [facebookId, linkedInId, googleId, twitterId].indexOf(value) >= 0;
	};

	var getIsLink = function(value) {
		return value.toLowerCase() === ConfigurationConstants.CommunicationTypes.Web.toLowerCase() ||
			value.toLowerCase() === ConfigurationConstants.CommunicationType.Email.toLowerCase();
	};

	var getAddButtonMenuItem = function(item) {
		return {
			caption: item.caption,
			tag: item.tag,
			click: {bindTo: item.click.bindTo}
		};
	};

	var getSocialNetworkName = function(socialNetworkId) {
		switch (socialNetworkId) {
			case facebookId:
				return 'Facebook';
			case linkedInId:
				return 'LinkedIn';
			case googleId:
				return 'Google';
			case twitterId:
				return 'Twitter';
			default:
				return '';
		}
	};

	var getContainerConfig = function(id, styles) {
		var container = {
			className: 'Terrasoft.Container',
			items: [],
			id: id,
			selectors: {wrapEl: '#' + id}
		};
		if (styles) {
			container.classes = {wrapClassName: styles};
		}
		return container;
	};

	var getSocialIconConfig = function(name, bindTo, filterValue, onClick, context) {
		var imageConfig = resources.localizableImages[getSocialNetworkName(filterValue) + 'Icon'];
		var imageUrl = Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
		var html = '<div id = ' + name + '-div><img id = "' + name + '" ' + 'src = "' + imageUrl + '"></div>';
		return {
			id: name,
			className: 'Terrasoft.HtmlControl',
			html: html,
			selectors: {wrapEl: '#' + name},
			onAfterRender: function() {
				var icon = Ext.get(name);
				var div = Ext.get(name.substring(0, name.lastIndexOf('-')) + '-view');
				icon.on('click', onClick.bind(context));
				div.addCls('communication-detail-social-icon');
			},
			visible: {
				bindTo: bindTo,
				bindConfig: {
					converter: function(communicationType) {
						return communicationType.value === filterValue;
					}
				}
			}
		};
	};

	structure.userCode = function() {
		switch (this.filterPath) {
			case 'Contact':
				this.entitySchema = ContactCommunication;
				filterSchemaName = 'Contact';
				break;
			case 'Account':
				this.entitySchema = AccountCommunication;
				filterSchemaName = 'Account';
				break;
		}
		this.name = 'CommunicationDetailViewModel';
		this.parentColumnPath = 'Id';
		this.typeColumn = 'CommunicationType';
		this.filterColumnPath = filterSchemaName;
		this.attributes = [{
			type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
			name: 'CommunicationType',
			columnPath: 'CommunicationType',
			dataValueType: Terrasoft.DataValueType.ENUM
		}, {
			type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
			name: 'Number',
			columnPath: 'Number',
			dataValueType: Terrasoft.DataValueType.TEXT
		}, {
			type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
			name: filterSchemaName,
			columnPath: filterSchemaName,
			dataValueType: Terrasoft.DataValueType.ENUM
		}, {
			type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
			name: 'SocialMediaId',
			columnPath: 'SocialMediaId',
			dataValueType: Terrasoft.DataValueType.TEXT
		}];
		this.methods.filterTypes = function(select) {
			select.addColumn('[ComTypebyCommunication:CommunicationType].Communication', 'additionalValue');
			var columnPath = 'Usefor' + filterSchemaName + 's';
			select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, columnPath,
				true));
			var primaryDisplayColumn = select.columns.get('displayValue');
			primaryDisplayColumn.orderDirection = Terrasoft.OrderDirection.ASC;
			return columnPath;
		};
		this.methods.getCustomItemView = function(viewModel, itemKey, action, types) {
			Terrasoft.each(types, function(item) {
				item.click = {bindTo: 'typeChanged'};
			});
			var columns = viewModel.attributes;
			var typeColumn = columns[0];
			var numberColumn = columns[1];
			var viewConfig;
			switch (action) {
				case 'add':
				case 'copy':
				case 'edit':
					viewConfig = getContainerConfig(itemKey + '-view', 'detail-edit-container-user-class');
					var titleConfig = getContainerConfig(itemKey + '-title', 'controlCaption');
					var valueConfig = getContainerConfig(itemKey + '-value');
					var typeButtonConfig = {
						id: itemKey + '-type',
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: 'detail-type-btn-user-class',
							innerWrapperClass: 'communication-detail-type-btn-inner-user-class'
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {wrapEl: '#' + itemKey + '-type'},
						caption: {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: function(value, type) {
									return Terrasoft.getTypedStringValue(value, type);
								}
							}
						},
						menu: {items: types}
					};
					var deleteButtonConfig = {
						id: itemKey + '-delete',
						className: 'Terrasoft.Button',
						classes: {wrapperClass: 'detail-delete-btn-user-class'},
						imageConfig: resources.localizableImages.DeleteIcon,
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {wrapEl: '#' + itemKey + '-delete'},
						click: {bindTo: 'delete'}
					};
					var editConfig = {
						id: itemKey + '-edit',
						className: 'Terrasoft.TextEdit',
						classes: {wrapClass: 'communication-lookup-img-user-class'},
						value: {
							bindTo: numberColumn.name,
							bindConfig: {
								converter: function(value) {
									return value;
								}
							}
						},
						rightIconConfig: {
							source: Terrasoft.ImageSources.URL,
							url: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.LookUpIcon)
						},
						enabled: {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: function(value) {
									return !getIsSocialNetwork(value.value);
								}
							}
						},
						enableRightIcon: {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: function(value) {
									return getIsSocialNetwork(value.value);
								}
							}
						},
						onRightIconClick: this.onLookUpClick.bind(this)
					};
					titleConfig.items.push(typeButtonConfig, deleteButtonConfig);
					valueConfig.items.push(editConfig);
					viewConfig.items.push(titleConfig, valueConfig);
					break;
				case 'view':
					viewConfig = getContainerConfig(itemKey + '-view', 'detail-view-container-user-class');
					var typeLabel = {
						className: 'Terrasoft.Label',
						labelClass: 't-label communication-detail-type-lbl-user-class',
						caption: {
							bindTo: typeColumn.name,
							bindConfig: {converter: Terrasoft.getTypedStringValue}
						},
						visible: {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: function(value) {
									return !getIsSocialNetwork(value.value);
								}
							}
						}
					};
					var id = itemKey + '-number';
					var numberLabel = {
						id: id,
						selectors: {wrapEl: '#' + id},
						className: 'Terrasoft.Label',
						labelClass: 't-label communication-detail-number-lbl-user-class',
						click: {bindTo: 'onNumberClick'},
						caption: {bindTo: numberColumn.name},
						visible: {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: function(type) {
									if (type && getIsLink(type.value)) {
										var element = Ext.getCmp(id);
										element.labelClass += ' label-link label-ulr';
									}
									return !getIsSocialNetwork(type.value);
								}
							}
						}
					};
					var socials = getContainerConfig(itemKey + '-socials');
					socials.visible = {
						bindTo: typeColumn.name,
						bindConfig: {
							converter: function(value) {
								return getIsSocialNetwork(value.value);
							}
						}
					};
					var emptyContainer = getContainerConfig(itemKey + '-empty', 'detail-empty-user-class');
					emptyContainer.visible = {
						bindTo: typeColumn.name,
						bindConfig: {
							converter: function(value) {
								return !getIsSocialNetwork(value.value);
							}
						}
					};
					var onSocialClick = this.onSocialClick;
					var self = this;
					var facebookIcon = getSocialIconConfig(itemKey + '-Facebook', typeColumn.name, facebookId,
						onSocialClick, self);
					var linkedInIcon = getSocialIconConfig(itemKey + '-LinkedIn', typeColumn.name, linkedInId,
						onSocialClick, self);
					var googleIcon = getSocialIconConfig(itemKey + '-Google', typeColumn.name, googleId,
						onSocialClick, self);
					var twitterIcon = getSocialIconConfig(itemKey + '-Twitter', typeColumn.name, twitterId,
						onSocialClick, self);
					socials.items.push(facebookIcon, linkedInIcon, googleIcon, twitterIcon);
					viewConfig.items.push(typeLabel, numberLabel, emptyContainer, socials);
					break;
			}
			return viewConfig;
		};
		this.methods.onNumberClick = function() {
			var communicationType = this.get('CommunicationType');
			if (communicationType && getIsLink(communicationType.value)) {
				var url = this.get('Number');
				switch (communicationType.value.toLowerCase()) {
					case (ConfigurationConstants.CommunicationTypes.Web.toLowerCase()):
						if (url.toLowerCase().indexOf('http') === -1) {
							url = 'http://' + url;
						}
						window.open(url);
						break;
					case (ConfigurationConstants.CommunicationType.Email.toLowerCase()):
						EmailHelper.onEmailUrlClick(url);
						break;
				}
			}
		};
		this.methods.validate = function() {
			if (!this.isNew) {
				return this.callParent(arguments);
			}
			return true;
		};
		this.methods.saveEntity = function(callback) {
			if (this.get('Number')) {
				this.callParent(arguments);
			} else {
				callback();
			}
		};
		this.methods.onSocialClick = function(context) {
			var instanceId = context.target.id.substring(0, 36);
			var viewModelItems = this.get('gridData').collection.items;
			var filteredItems = viewModelItems.filter(function(value) {
					return (value.instanceId === instanceId);
				}
			);
			var viewModelItem = filteredItems[0];
			var socialMediaId = viewModelItem.get('SocialMediaId');
			var socialNetworkName = getSocialNetworkName(viewModelItem.get('CommunicationType').value);
			if (socialMediaId) {
				ServiceHelper.callService('GetSocialProfileService', 'GetPublicProfileUrl', function(response) {
					var result = response.GetPublicProfileUrlResult;
					if (result) {
						if (Ext.isIE) {
							result = result.replace('#!/', '');
						}
						window.open(result);
					}
				}, {
					'socialMediaId': socialMediaId,
					'socialNetworkName': socialNetworkName
				});
			}
		};
		this.methods.typeChanged = function(tag) {
			this.set('CommunicationType', tag);
		};
		this.methods.getAddButton = function(addButton, addButtonMenuItemsCollection) {
			addButton.menu = {items: []};
			var addButtonMenuItems = addButton.menu.items;
			var phonesMenuItemGroup = {
				caption: resources.localizableStrings.Phones,
				menu: {items: []}
			};
			var socialNetworksMenuItemGroup = {
				caption: resources.localizableStrings.Socials,
				menu: {items: []}
			};
			addButtonMenuItems.push(phonesMenuItemGroup);
			addButtonMenuItems.push(socialNetworksMenuItemGroup);
			addButtonMenuItemsCollection.forEach(function(item) {
				var communicationType = item.tag;
				var communication = communicationType.additionalValue;
				switch (communication.value) {
					case ConfigurationConstants.Communication.Email:
					case ConfigurationConstants.Communication.Skype:
					case ConfigurationConstants.Communication.Web:
						addButtonMenuItems.push(getAddButtonMenuItem(item));
						break;
					case ConfigurationConstants.Communication.Phone:
						phonesMenuItemGroup.menu.items.push(getAddButtonMenuItem(item));
						break;
					case ConfigurationConstants.Communication.SocialNetwork:
						socialNetworksMenuItemGroup.menu.items.push(getAddButtonMenuItem(item));
						break;
				}
			});
			if (filterSchemaName === 'Contact') {
				addButtonMenuItems.push({
					caption: resources.localizableStrings.Restrictions,
					menu: {
						items: [{
							caption: resources.localizableStrings.DoNotUseEmail,
							tag: 'DoNotUseEmail',
							click: {bindTo: 'doNotUseCommunication'}
						}, {
							caption: resources.localizableStrings.DoNotUseCall,
							tag: 'DoNotUseCall',
							click: {bindTo: 'doNotUseCommunication'}
						}, {
							caption: resources.localizableStrings.DoNotUseSms,
							tag: 'DoNotUseSms',
							click: {bindTo: 'doNotUseCommunication'}
						}, {
							caption: resources.localizableStrings.DoNotUseFax,
							tag: 'DoNotUseFax',
							click: {bindTo: 'doNotUseCommunication'}
						}, {
							caption: resources.localizableStrings.DoNotUseMail,
							tag: 'DoNotUseMail',
							click: {bindTo: 'doNotUseCommunication'}
						}]
					}
				});
			}
			return addButton;
		};
		this.methods.getDisplayOrder = function(data, operation) {
			if (operation === 'view') {
				data.sortByFn(function(a, b) {
					a = getIsSocialNetwork(a.get('CommunicationType').value);
					b = getIsSocialNetwork(b.get('CommunicationType').value);
					if (!a && b) {
						return -1;
					} else if (a && !b) {
						return 1;
					} else {
						return 0;
					}
				});
			}
			return data;
		};
		this.methods.doNotUseCommunication = function(tag) {
			sandbox.publish('DoNotUseCommunication', tag);
		};
		this.methods.onLookUpClick = function(context) {
			var viewModelItem;
			var instanceId = context.target.id.substring(0, 36);
			this.get('gridData').getItems().forEach(function(item) {
				if (item.instanceId === instanceId) {
					viewModelItem = item;
				}
			});
			if (viewModelItem) {
				var entityName = sandbox.publish('GetEntityName', null, [this.filterPath]);
				var config = {
					entitySchemaName: this.filterPath,
					mode: 'choice',
					recordId: viewModelItem.get(this.filterPath).value,
					recordName: entityName,
					socialNetwork: viewModelItem.get('CommunicationType').displayValue,
					moduleName: 'FindContactsInSocialNetworksModule'
				};
				LookupUtilities.ThrowOpenLookupMessage(sandbox, config, function(args) {
					viewModelItem.set('Number', args.name);
					viewModelItem.set('SocialMediaId', args.id);
				}, this, this.getCardModuleSandboxId());
			}
		};
		this.loadedColumns = [{
			columnPath: 'Number'
		}, {
			columnPath: 'SocialMediaId'
		}, {
			columnPath: 'CommunicationType'
		}, {
			columnPath: filterSchemaName
		}];
	};

	return structure;
});
