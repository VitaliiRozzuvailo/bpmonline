define("FindContactsInSocialNetworksModule", ["ext-base", "terrasoft", "sandbox", "SocialAccountAuthUtilities",
		"FindContactsInSocialNetworksModuleResources", "MaskHelper", "ConfigurationEnums", "Contact"],
	function(Ext, Terrasoft, sandbox, SocialAccountAuthUtilities, resources, MaskHelper, ConfigurationEnums, Contact) {

	var container = null;
	var viewModel = null;
	var viewConfig = null;
	var createNewContactCaption = null;

	/**
	 * Возвращает значение перечисления всех социальных сетей.
	 * @private
	 * @return {String} Значение перечисления всех социальных сетей.
	 */
	function getAllSocialNetworks() {
		var socialNetworks = "Facebook,Twitter";
		if (Contact.columns.LinkedIn.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
			socialNetworks += ",LinkedIn";
		}
		return socialNetworks;
	}

	function getView() {
		var btnCreateNewContactCaption;
		if (createNewContactCaption != null) {
			btnCreateNewContactCaption = createNewContactCaption;
		} else {
			btnCreateNewContactCaption = resources.localizableStrings.CreateNewContactButtonCaption;
		}
		return {
			className: "Terrasoft.Container",
			id: "view-container",
			selectors: {
				wrapEl: "#view-container"
			},
			items: [{
				className: "Terrasoft.Container",
				id: "top-buttons",
				selectors: {
					wrapEl: "#top-buttons"
				},
				items: [{
					className: "Terrasoft.Button",
					id: "btnCreateNewContact",
					caption: btnCreateNewContactCaption,
					style: Terrasoft.controls.ButtonEnums.style.GREEN,
					tag: "createNewContact",
					visible: {
						bindTo: "moduleMode",
						bindConfig: {
							converter: function(value) {
								return isSearchMode(value);
							}
						}
					},
					click: {
						bindTo: "onCreateNewContactBtnClick"
					},
					classes: {
						textClass: "top-button"
					}
				}, {
					className: "Terrasoft.Button",
					id: "btnOk",
					caption: resources.localizableStrings.OKButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.GREEN,
					tag: "ok",
					visible: {
						bindTo: "moduleMode",
						bindConfig: {
							converter: function(value) {
								return !isSearchMode(value);
							}
						}
					},
					click: {
						bindTo: "onOKBtnClick"
					},
					classes: {
						textClass: "top-button"
					}
				}, {
					className: "Terrasoft.Button",
					id: "btnClose",
					caption: resources.localizableStrings.CloseButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.GRAY,
					tag: "close",
					click: {
						bindTo: "onCloseBtnClick"
					},
					classes: {
						textClass: "top-button"
					}
				}, {
					className: "Terrasoft.Button",
					id: "btnView",
					caption: resources.localizableStrings.ViewButtonCaption,
					tag: "view",
					click: {
						bindTo: "onViewBtnClick"
					},
					classes: {
						textClass: "top-button"
					}
				}],
				classes: {
					wrapClassName: ["top-buttons"]
				}
			}, {
				className: "Terrasoft.Container",
				id: "search-area",
				selectors: {
					wrapEl: "#search-area"
				},
				items: [{
					className: "Terrasoft.TextEdit",
					id: "edSearch",
					classes: {
						wrapClass: ["search-edit"]
					},
					enterkeypressed: {
						bindTo: "onFindBtnClick"
					},
					value: {
						bindTo: "searchCriteria"
					}
				}, {
					className: "Terrasoft.Container",
					id: "findButtonContainer",
					selectors: {
						wrapEl: "#findButtonContainer"
					},
					classes: {
						wrapClassName: ["find-button"]
					},
					items: [{
						className: "Terrasoft.Button",
						id: "btnFind",
						caption: resources.localizableStrings.FindButtonCaption,
						tag: "find",
						click: {
							bindTo: "onFindBtnClick"
						}
					}]
				}]
			}, {
				className: "Terrasoft.Container",
				id: "filterArea",
				selectors: {
					wrapEl: "#filterArea"
				},
				visible: {
					bindTo: "moduleMode",
					bindConfig: {
						converter: function(value) {
							return isSearchMode(value);
						}
					}
				},
				items: [{
					className: "Terrasoft.Label",
					caption: resources.localizableStrings.FilterSocialNetworksLabelCaption,
					classes: {
						labelClass: ["controlCaption"]
					}
				},
					{
						className: "Terrasoft.ComboBoxEdit",
						id: "cbxFilterSocialNetworks",
						classes: {
							wrapClass: ["filter-social-networks"]
						},
						value: {
							bindTo: "SocialNetworkFilterListValue"
						},
						list: {
							bindTo: "SocialNetworkFilterList"
						},
						prepareList: {
							bindTo: "GetSocialNetworkFilterListData"
						},
						markerValue: resources.localizableStrings.FilterSocialNetworksLabelCaption
					}]
			}, {
				className: "Terrasoft.Container",
				id: "resultsArea",
				selectors: {
					wrapEl: "#resultsArea"
				},
				items: [{
					className: "Terrasoft.Label",
					caption: resources.localizableStrings.ResultsLabelCaption,
					classes: {
						labelClass: ["controlCaption"]
					}
				}, {
					className: "Terrasoft.Grid",
					id: "grdResults",
					type: "listed",
					activeRow: {
						bindTo: "activeRow"
					},
					collection: {
						bindTo: "gridData"
					},
					captionsConfig: [{
						cols: 24,
						name: resources.localizableStrings.SocialAccountColCaption
					}],
					columnsConfig: [{
						cols: 24,
						key: [{
							name: {
								bindTo: "socialnetworkImage"
							},
							type: "grid-icon-32x32"
						}, {
							name: {
								bindTo: "Name"
							},
							type: "text"
						}]
					}]
				}]
			}]
		};
	}

	function getSearchViewModel() {
		viewConfig = getView();
		var view = Ext.create(viewConfig.className || "Terrasoft.Container", viewConfig);
		viewModel = getViewModel();
		view.bind(viewModel);
		var historyState = sandbox.publish("LookupInfo", null, [sandbox.id]);
		if (historyState == null) {
			historyState = sandbox.publish("GetHistoryState").state;
		}
		if (!historyState.mode) {
			historyState = sandbox.publish("SetInitialisationData", null, [sandbox.id]);
		}
		var mode = historyState.mode;
		viewModel.set("moduleMode", mode);
		if (mode === "choice") {
			var socialNetworkValue = {
				value: historyState.socialNetwork
			};
			viewModel.set("SocialNetworkFilterListValue", socialNetworkValue);
		}
		viewModel.set("searchCriteria", historyState.recordName);
		MaskHelper.HideBodyMask();
		view.render(container);
		return viewModel;
	}

	function getViewModel() {
		return Ext.create("Terrasoft.BaseViewModel", {
			values: {
				moduleMode: "search",
				searchCriteria: "",
				activeRow: "",
				gridData: Ext.create("Terrasoft.BaseViewModelCollection", {
					listeners: {
						dataloaded: function() {
							this.sortByFn(function(o1, o2) {
								var property1 = o1.get("Name");
								var property2 = o2.get("Name");
								if (property1 === property2) {
									return 0;
								}
								return (property1 < property2) ? -1 : 1;
							});
						}
					},
					rowConfig: {Name: "Name", Id: "Id"}
				}),
				/**
				 * Название социальной сети, по которой будут отфильтрованы результаты поиска. "Все социальные сети" по
				 * умолчанию
				 * @type {String}
				 */
				SocialNetworkFilterListValue: {
					value: getAllSocialNetworks(),
					displayValue: resources.localizableStrings.AllSocialNetworksCaption
				},
				SocialNetworkFilterList: new Terrasoft.Collection()
			},
			methods: {
				GetSocialNetworkFilterListData: function(filter, list) {
					list.clear();
					var listValues = {
						"0": {
							value: getAllSocialNetworks(),
							displayValue: resources.localizableStrings.AllSocialNetworksCaption
						},
						"2": {value: "Facebook", displayValue: "Facebook"},
						"3": {value: "Twitter", displayValue: "Twitter"}
					};
					if (Contact.columns.LinkedIn.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
						listValues["1"] = {value: "LinkedIn", displayValue: "LinkedIn"};
					}
					list.loadAll(listValues);
				},
				onCloseBtnClick: function() {
					sandbox.publish("BackHistoryState");
				},
				onOKBtnClick: function() {
					var activeRow = getActiveRow(this);
					var socialNetworkName = this.get("SocialNetworkFilterListValue").value;
					if (activeRow !== null) {
						var id = activeRow.values["Id"];
						var name = activeRow.values["Name"];
						sandbox.publish("ResultSelectedRows", {
							id: id,
							name: name,
							socialNetworkName: socialNetworkName
						}, [sandbox.id]);
					}
					sandbox.publish("BackHistoryState");
				},
				onViewBtnClick: function() {
					var activeRow = getActiveRow(this);
					var profileUrl;
					if (activeRow !== null) {
						profileUrl = activeRow.values["PublicProfileUrl"];
					}
					if (profileUrl !== undefined && profileUrl !== "") {
						if (Ext.isIE) {
							profileUrl = profileUrl.replace("#!/", "");
						}
						window.open(profileUrl);
					}
				},
				onCreateNewContactBtnClick: function() {
					var activeRow = getActiveRow(this);
					if (activeRow !== null) {
						createContactBySocialProfile(activeRow);
					}
				},
				onFindBtnClick: function() {
					this.set("activeRow", "");
					doSearchSocialData(this);
				}
			}
		});
	}

	function isSearchMode(mode) {
		return mode === "search";
	}

	function doSearchSocialData(scope) {
		var searchCriteria = scope.get("searchCriteria");
		if (searchCriteria === "") {
			return;
		}
		var gridData = scope.get("gridData");
		gridData.clear();
		MaskHelper.ShowBodyMask();
		var socialNetwork = scope.get("SocialNetworkFilterListValue").value;
		var dataSend = {
			searchCriteria: searchCriteria,
			socialNetworks: socialNetwork
		};
		var ajaxProvider = Terrasoft.AjaxProvider;
		callServiceMethod(ajaxProvider, "FindUsers", function(response) {
			if (response.FindUsersResult) {
				var responseData = Ext.decode(response.FindUsersResult);
				var exceptionNetworks = responseData.exceptionNetworks;
				var accessTokenExNetworks = responseData.accessTokenExNetworks;
				if (exceptionNetworks !== undefined && exceptionNetworks !== "" && exceptionNetworks !== "None") {
					showInformationDialog(this, exceptionNetworks, resources.localizableStrings.SocialNetworkError);
				}
				if (accessTokenExNetworks !== undefined && accessTokenExNetworks !== ""
					&& accessTokenExNetworks !== "None") {
					showAuthInformationDialog(this, accessTokenExNetworks,
						resources.localizableStrings.SocialNetworksError);
				}
				var results = {};
				Terrasoft.each(responseData.users, function(item) {
					if (item.Person) {
						item = item.Person;
						item.SocialNetwork = 4;
					}
					var viewModel = Ext.create("Terrasoft.BaseViewModel", {
						rowConfig: {
							Id: {caption: "Id", dataValueType: Terrasoft.DataValueType.GUID},
							Name: {caption: "Name", dataValueType: Terrasoft.DataValueType.TEXT},
							socialnetworkImage: {caption: "Image",
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								primaryImageColumnName: "socialnetworkImage",
								isLookup: true}
						},
						values: item,
						methods: {
							getLookupImageUrl: function() {
								var socialNetwork = this.get("SocialNetwork");
								var image = null;
								switch (socialNetwork) {
									case 2:
										image = resources.localizableImages.facebookimg;
										break;
									case 4:
										image = resources.localizableImages.linkedinimg;
										break;
									case 8:
										image = resources.localizableImages.twitterimg;
										break;
								}
								return Terrasoft.ImageUrlBuilder.getUrl(image);
							}
						}
					});
					if (item.Id) {
						results[item.Id] = viewModel;
					} else if (item.Person) {
						results[item.Person.Id] = viewModel;
					}

				});
				gridData.loadAll(results);
			}
			MaskHelper.HideBodyMask();
		}, dataSend, scope);
	}

	function showInformationDialog(scope, networks, message) {
		scope.showInformationDialog(message + networks);
	}

	function showAuthInformationDialog(scope, networks, message) {
		if (networks == undefined || networks == "") {
			return;
		}
		if (networks == "All") {
			networks = "Facebook, Twitter";
			if (Contact.columns.LinkedIn.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
				networks += ", LinkedIn";
			}
		}
		var socialNetwork = networks.split(", ")[0];
		var cfg = {
			style: Terrasoft.MessageBoxStyles.BLUE
		};
		scope.showConfirmationDialog(
			message + networks, function getSelectedButton(returnCode) {
				if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
					openSocialNetworkAuthWindow(socialNetwork, scope);
				}
			}, ["yes", "no"], cfg);
	}

	function openSocialNetworkAuthWindow(socialNetwork, scope) {
		SocialAccountAuthUtilities.checkSysSettingsAndOpenWindow(socialNetwork, sandbox, function() {
			scope.onFindBtnClick();
		});
	}

	function callServiceMethod(ajaxProvider, methodName, callback, dataSend, scope) {
		var data = dataSend || {};
		var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/GetSocialProfileService/" + methodName;
		ajaxProvider.request({
			url: requestUrl,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			method: "POST",
			jsonData: data,
			scope: scope,
			callback: function(request, success, response) {
				var responseObject = {};
				if (success) {
					responseObject = Terrasoft.decode(response.responseText);
				}
				callback.call(this, responseObject);
			}
		});
	}

	function createContactBySocialProfile(currItem) {
		var dataSend = {
			socialMediaId: currItem.values.SocialNetwork,
			socialAccountId: currItem.values.Id
		};
		var ajaxProvider = Terrasoft.AjaxProvider;
		callServiceMethod(ajaxProvider, "GetSocialProfile", function(response) {
			var socialProfileData = [];
			var result = Ext.decode(response.GetSocialProfileResult);
			Terrasoft.each(result, function(value, key) {
				if (value != null) {
					switch (key) {
						case "SocialNetwork":
							socialProfileData.push({
								name: value,
								value: this.Name
							});
							break;
						case "ProfileId":
							socialProfileData.push({
								name: this.SocialNetwork + "Id",
								value: value
							});
							break;
						case "BirthDate":
							socialProfileData.push({
								name: key,
								value: new Date(value)
							});
							break;
						case "City":
							if (!Terrasoft.isEmptyGUID(value)) {
								socialProfileData.push({
									name: "City",
									value: value
								});
							}
							break;
						case "Country":
							if (!Terrasoft.isEmptyGUID(value)) {
								socialProfileData.push({
									name: "Country",
									value: value
								});
							}
							break;
						case "Gender":
							break;
						case "GenderId":
							if (!Terrasoft.isEmptyGUID(value)) {
								socialProfileData.push({
									name: "Gender",
									value: value
								});
							}
							break;
						default:
							socialProfileData.push({
								name: key,
								value: value
							});
					}
				}
			});
			if (Object.keys(socialProfileData).length > 0) {
				openContactPage(socialProfileData);
			}
		}, dataSend, this);
	}

	function openContactPage(socialProfileData) {
		var initialisationData = sandbox.publish("SetInitialisationData", null, [sandbox.id]);
		var historyState = sandbox.publish("GetHistoryState");
		socialProfileData.push({
			name: "Account",
			value: initialisationData.recordId
		});
		sandbox.publish("PushHistoryState", {
			hash: historyState.hash.historyState,
			stateObj: {
				isSeparateMode: true,
				schemaName: "ContactPageV2",
				entitySchemaName: "Contact",
				operation: ConfigurationEnums.CardStateV2.ADD,
				valuePairs: socialProfileData
			}
		});
		sandbox.loadModule("CardModuleV2", {
			renderTo: container,
			keepAlive: true
		});
	}

	function getActiveRow(scope) {
		var activeRow = scope.get("activeRow");
		if (activeRow) {
			var gridData = scope.get("gridData");
			return gridData.get(activeRow);
		}
		return null;
	}

	function render(renderTo) {
		var headerCaption = resources.localizableStrings.SearchEditLabelCaption;
		sandbox.publish("ChangeHeaderCaption", {
			caption: headerCaption,
			dataViews: new Terrasoft.Collection()
		});
		sandbox.subscribe("NeedHeaderCaption", function() {
			sandbox.publish("InitDataViews", { caption: headerCaption });
		}, this);
		if (viewModel) {
			var config = getView();
			var view = Ext.create(config.className || "Terrasoft.Container", config);
			view.bind(viewModel);
			view.render(renderTo);
			return;
		}
		container = renderTo;
		viewModel = getSearchViewModel();
		doSearchSocialData(viewModel);
	}

	function init() {
		var state = sandbox.publish("GetHistoryState");
		var currentHash = state.hash;
		var currentState = state.state || {};
		if (currentState.moduleId !== sandbox.id) {
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish("PushHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}
	}

	return {
		init: init,
		render: render
	};
});