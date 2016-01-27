define('ContactSection', ['Contact','ext-base', 'terrasoft', 'ContactSectionStructure', 'sandbox', 'ContactSectionResources', 'MaskHelper'],
	function(Contact, Ext, Terrasoft, structure, sandbox, resources, MaskHelper) {
		structure.userCode = function() {
			this.entitySchema = Contact;
			this.name = 'ContactSectionViewModel';

			function createSyncJobs(collection) {
				var requestsCount = 0;
				var messageArray = [];
				var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/MailboxSettingsService/CreateContactSyncJob";
				Terrasoft.each(collection, function(item) {
					var data = {
						interval: 0,
						senderEmailAddress: item.get("SenderEmailAddress")
					};
					MaskHelper.ShowBodyMask();
					requestsCount++;
					Terrasoft.AjaxProvider.request({
						url: requestUrl,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						method: 'POST',
						jsonData: data,
						scope: this,
						callback: function(request, success, response) {
							if (success) {
								var responseData = Ext.decode(response.responseText);
								if (!Ext.isEmpty(responseData.CreateContactSyncJobResult)) {
									messageArray = messageArray.concat(responseData.CreateContactSyncJobResult);
								}
							}
							if (--requestsCount <= 0) {
								this.clear();
								this.load();
								var message = "Синхронизация контактов запущена";
								if (messageArray.length > 0) {
									message = '';
									Terrasoft.each(messageArray, function(element) {
										message = message.concat(element);
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

			this.methods.synchronizeContacts = function() {
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'ContactSyncSettings'
				});
				select.addColumn('Id');
				select.addColumn('[MailboxSyncSettings:Id:MailboxSyncSettings].SenderEmailAddress',
					'SenderEmailAddress');
				select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'[MailboxSyncSettings:Id:MailboxSyncSettings].SysAdminUnit',
					Terrasoft.SysValue.CURRENT_USER.value));
				var filterGroup = select.createFilterGroup();
				filterGroup.name = "SynContactsFilterGroup";
				filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
				filterGroup.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'ImportContacts', true));
				filterGroup.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					'ExportContacts', true));
				select.filters.addItem(filterGroup);
				select.getEntityCollection(function(response) {
					if (response.success) {
						if (response.collection.getCount() < 1) {
							Terrasoft.utils.showInformation(
								resources.localizableStrings.SyncSettingsNotFoundMessage,
								null, null, { buttons: ["ok"] });
							return;
						}
						createSyncJobs.call(this, response.collection.getItems());
					} else {
						Terrasoft.utils.showInformation(
							resources.localizableStrings.ReadSyncSettingsBadResponse,
							null, null, { buttons: ["ok"] });
					}
				}, this);
			};

			var actions = this.actions;
			if (!actions) {
				actions = [];
			}
			actions.push({
				caption: resources.localizableStrings.SynchronizeContactsCaption,
				methodName: "synchronizeContacts"
			});
			this.actions = actions;
		};
		return structure;
	});
