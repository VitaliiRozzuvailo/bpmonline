define('SocialAccountAuthModule', ['sandbox', 'ext-base', 'terrasoft', 'OAuthAuthenticationModule', 'SocialAccountAuthUtilities', 'SocialAccountAuthModuleResources'],
	function(sandbox, Ext, Terrasoft, OAuthAuthenticationModule, SocialAccountAuthUtilities, resources) {
		var oAuthAuthenticationModule = OAuthAuthenticationModule; // HACK!!!
		var viewModel;
		function getView() {
			var container = Ext.create('Terrasoft.Container', {
				id: 'main',
				selectors: {
					wrapEl: '#main'
				},
				items: [
					{
						className: 'Terrasoft.Container',
						id: 'topButtons',
						selectors: {
							wrapEl: '#topButtons'
						},
						classes: {
							wrapClassName: ['container-spacing']
						},
						items: [
							{
								className: 'Terrasoft.Button',
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								caption: resources.localizableStrings.OKButtonCaption,
								classes: {
									textClass: ['main-buttons']
								},
								click: {
									bindTo: 'onOKButtonClick'
								}
							},
							{
								className: 'Terrasoft.Button',
								style: Terrasoft.controls.ButtonEnums.style.GRAY,
								caption: resources.localizableStrings.CancelButtonCaption,
								classes: {
									textClass: ['main-buttons']
								},
								click: {
									bindTo: 'onCancelButtonClick'
								}
							}
						]
					},
					{
						className: 'Terrasoft.Container',
						id: 'consumerKeyEdit',
						selectors: {
							wrapEl: '#consumerKeyEdit'
						},
						classes: {
							wrapClassName: ['container-spacing']
						},
						items: [
							{
								className: 'Terrasoft.Label',
								classes: {
									labelClass: ['labelEdit']
								},
								caption: resources.localizableStrings.ConsumerKeyEditCaption,
								visible: true
							},
							{
								className: 'Terrasoft.TextEdit',
								value: {
									bindTo: 'consumerKey'
								}
							}
						]
					},
					{
						className: 'Terrasoft.Container',
						id: 'consumerSecretEdit',
						selectors: {
							wrapEl: '#consumerSecretEdit'
						},
						classes: {
							wrapClassName: ['container-spacing']
						},
						items: [
							{
								className: 'Terrasoft.Label',
								classes: {
									labelClass: ['labelEdit']
								},
								caption: resources.localizableStrings.ConsumerSecretEditCaption,
								visible: true
							},
							{
								className: 'Terrasoft.TextEdit',
								value: {
									bindTo: 'consumerSecret'
								}
							}
						]
					}
				]
			});
			return container;
		}

		function getViewModel() {
			if (!viewModel) {
				viewModel = Ext.create('Terrasoft.BaseViewModel', {
					values: {
						socialNetwork: '',
						consumerKey: '',
						consumerSecret: ''
					},
					methods: {
						onOKButtonClick: function() {
							var socialNetworkName = viewModel.get("socialNetwork");
							var consumerSecret = viewModel.get("consumerSecret");
							var consumerKey = viewModel.get("consumerKey");
							saveSysSettingsAndAuthenticate(socialNetworkName, consumerKey, consumerSecret);
						},
						onCancelButtonClick: function() {
							sandbox.publish('BackHistoryState');
						}
					}
				});
			}
			return viewModel;
		}

		function gotoOldOAuthAuthenticationUrl(socialNetworkName) {
			SocialAccountAuthUtilities.gotoOldOAuthAuthenticationUrl(socialNetworkName, function () {
				viewModel.onCancelButtonClick(); });
		}

		function saveSysSettingsAndAuthenticate(socialNetworkName, consumerKey, consumerSecret) {
			SocialAccountAuthUtilities.renewConsumerKey(consumerKey);
			var settingsProvider = Terrasoft.SysSettings;
			settingsProvider.postSysSettingsValue(socialNetworkName + 'ConsumerKey', consumerKey, function() {
				settingsProvider.postSysSettingsValue(socialNetworkName + 'ConsumerSecret', consumerSecret, function () {
					gotoOldOAuthAuthenticationUrl(socialNetworkName);
				});
			});
		}

		function render(renderTo) {
			var socialNetwork = getSocialNetwork();
			var settingsProvider = Terrasoft.SysSettings;
			var arrayToQuery = [socialNetwork + 'ConsumerKey', socialNetwork + 'ConsumerSecret'];
			var funcCallBack = function(itemValues) {
				initialize(itemValues, renderTo, socialNetwork);
			}
			settingsProvider.querySysSettings(arrayToQuery, funcCallBack);
		}

		function getSocialNetwork(){
			var historyState = sandbox.publish('GetHistoryState');
			if (historyState.state != null) {
				return historyState.state.socialNetwork;
			}
			return 'Facebook';
		}

		function initialize(itemValues, renderTo, socialNetwork) {
			var view = getView();
			var viewModel = getViewModel();
			var consumerKey = itemValues[socialNetwork + 'ConsumerKey'];
			var consumerSecret = itemValues[socialNetwork + 'ConsumerSecret'];
			viewModel.set("consumerKey", consumerKey);
			viewModel.set("consumerSecret", consumerSecret);
			viewModel.set("socialNetwork", socialNetwork);
			if (consumerKey != '' && consumerSecret != '') {
				gotoOldOAuthAuthenticationUrl(socialNetwork);
			} else {
				view.bind(viewModel);
				view.render(renderTo);
			}
		}

		function init() {
			var map = {};
			map['OAuthAuthenticationModule'] = {
				sandbox: 'sandbox_' + sandbox.id,
				'ext-base': 'ext_' + Ext.id
			};
			requirejs.config({
				map: map
			});
		}

		return {
			init: init,
			render: render
		};
	});
