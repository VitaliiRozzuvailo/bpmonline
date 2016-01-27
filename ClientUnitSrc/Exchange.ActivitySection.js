define('ActivitySection', ['ext-base', 'terrasoft', 'sandbox', 'Activity', 'ActivitySectionStructure',
	'ActivitySectionResources', 'ProcessModule', 'SectionViewGenerator', 'ActionUtilitiesModule',
	'ConfigurationEnums', 'ConfigurationConstants', 'EmailUtilities', 'BaseFiltersGenerateModule', 'MaskHelper',
	'ExchangeNUIConstants'],
	function(Ext, Terrasoft, sandbox, Activity, structure, resources, processModule, SectionViewGenerator,
	actionUtilities, ConfigurationEnums, ConfigurationConstants, EmailUtilities,
	BaseFiltersGenerateModule, MaskHelper, ExchangeNUIConstants) {
		structure.userCode = function() {

			function downloadMessages(collection) {
				var requestsCount = 0;
				var messageArray = [];
				Terrasoft.each(collection, function(item) {
					var requestUrl;
					if (item.get('MailServerTypeId') === ExchangeNUIConstants.MailServer.Type.Exchange) {
						requestUrl = Terrasoft.workspaceBaseUrl +
							'/ServiceModel/ProcessEngineService.svc/LoadExchangeEmailsProcess/' +
							'Execute?ResultParameterName=LoadResult' +
							'&SenderEmailAddress=' + item.get('SenderEmailAddress');
					} else {
						requestUrl = Terrasoft.workspaceBaseUrl +
							'/ServiceModel/ProcessEngineService.svc/LoadImapEmailsProcess/' +
							'Execute?ResultParameterName=LoadResult' +
							'&MailBoxFolderId=' + item.get('Id');
					}
					MaskHelper.ShowBodyMask();
					requestsCount++;
					Ext.Ajax.request({
						url: requestUrl,
						timeout: 180000,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						method: 'POST',
						scope: this,
						callback: function(request, success, response) {
							if (success) {
								var responseData = Ext.decode(
									Ext.decode(response.responseXML.firstChild.textContent)
								);
								if (responseData.Messages.length > 0) {
									messageArray = messageArray.concat(responseData.Messages);
								}
							}
							if (--requestsCount <= 0) {
								this.clear();
								this.load();
								var message = resources.localizableStrings.LoadImapEmailsResultEx;
								if (messageArray.length > 0) {
									message = '';
									Terrasoft.each(messageArray, function(element) {
										message = message.concat(Ext.String.format('[{0}]: {1} ', element.key,
											element.message));
									}, this);
								}
								MaskHelper.HideBodyMask();
								Terrasoft.utils.showInformation(
									message, null, null,
									{ buttons: ['ok'] });
							}
						}
					});
				}, this);
			}

			this.methods.loadEmails = function() {
				if (!this.get('isMailboxSyncExist')) {
					var buttonsConfig = {
						buttons: [Terrasoft.MessageBoxButtons.OK.returnCode],
						defaultButton: 0
					};
					Terrasoft.showInformation(resources.localizableStrings.MailboxSettingsEmptyEx,
						function() {}, this, buttonsConfig);
					return;
				}
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'ActivityFolder'
				});
				select.addColumn('Id');
				select.addColumn('[MailboxSyncSettings:MailboxName:Name].SenderEmailAddress', 'SenderEmailAddress');
				select.addColumn('[MailboxSyncSettings:MailboxName:Name].MailServer.Type.Id', 'MailServerTypeId');
				select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'[MailboxSyncSettings:MailboxName:Name].SysAdminUnit', Terrasoft.SysValue.CURRENT_USER.value));
				select.getEntityCollection(function(response) {
					if (response.success) {
						downloadMessages.call(this, response.collection.getItems());
					}
				}, this);
			};

		};
		return structure;
	});
