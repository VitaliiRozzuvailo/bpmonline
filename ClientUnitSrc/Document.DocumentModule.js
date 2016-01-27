define('DocumentModule', ['ext-base', 'terrasoft', 'DocumentModuleResources', 'GeneralDetails', 'ConfigurationEnums'],
	function(Ext, Terrasoft, resources, GeneralDetails, ConfigurationEnums) {

		var rightPanel = [

			GeneralDetails.Visa('Document'), {
				name: 'product',
				schemaName: 'ProductDetail',
				type: Terrasoft.ViewModelSchemaItem.DETAIL,
				filterPath: 'Document',
				filterValuePath: 'Id',
				caption: resources.localizableStrings.ProductDetailCaption,
				visible: true,
				collapsed: false,
				leftWidth: '60%',
				rightWidth: '40%',
				wrapContainerClass: 'control-group-container'
			}, {
				name: 'document',
				schemaName: 'DocumentDetail',
				type: Terrasoft.ViewModelSchemaItem.DETAIL,
				filterPath: 'Parent',
				filterValuePath: 'Id',
				caption: resources.localizableStrings.DocumentDetailCaption,
				visible: true,
				leftWidth: '60%',
				rightWidth: '40%',
				wrapContainerClass: 'control-group-container'
			}, {
				name: 'activity',
				schemaName: 'ActivityDetail',
				type: Terrasoft.ViewModelSchemaItem.DETAIL,
				filterPath: 'Document',
				filterValuePath: 'Id',
				caption: resources.localizableStrings.ActivityDetailCaption,
				visible: true,
				leftWidth: '60%',
				rightWidth: '40%',
				wrapContainerClass: 'control-group-container'
			}, GeneralDetails.File('Document'), GeneralDetails.Notes('Notes')
		];

		function getParentRules(BusinessRuleModule) {
			return [
				{
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: false,
					baseAttributePatch: 'Account',
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					attribute: 'Account'
				},
				{
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					baseAttributePatch: 'Supplier',
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					attribute: 'Supplier'
				}
			];
		}

		function pageInit() {
			if (this.action === ConfigurationEnums.CardState.Add ||
				this.action === ConfigurationEnums.CardState.Copy) {
				this.getIncrementCode('Document', function(responce) {
					this.set('Number', responce);
				});
			}
		}

		function pageValidate() {
			var isValid = true;
			if (isValid) {
				var account = this.get('Account');
				var contact = this.get('Contact');
				var accountColumnCaption, contactColumnCaption;
				if (Ext.isEmpty(account) && Ext.isEmpty(contact)) {
					if (this.entitySchema) {
						accountColumnCaption = this.entitySchema.getColumnByName('Account').caption || '';
						contactColumnCaption = this.entitySchema.getColumnByName('Contact').caption || '';
					}
					this.showInformationDialog(Ext.String.format(
						resources.localizableStrings.WarningAccountContactRequire,
						accountColumnCaption, contactColumnCaption));
					isValid = false;
				}
			}
			if (isValid && (!this.changedValues || !Ext.isEmpty(this.changedValues.Number))) {
				isValid = false;
				var id = this.get('Id');
				var number = this.get('Number');
				var buttonsConfig = {
					buttons: [Terrasoft.MessageBoxButtons.YES.returnCode, Terrasoft.MessageBoxButtons.NO.returnCode],
					defaultButton: 0
				};
				if (!Ext.isEmpty(number)) {
					var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
						rootSchemaName: 'Document'
					});
					esq.addColumn('Id');
					var filterId = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
						'Id', id);
					var filterNum = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						'Number', number);
					esq.filters.add('primaryIdFilter', filterId);
					esq.filters.add('numberFilter', filterNum);

					esq.getEntityCollection(function(result) {
						var collection = result.collection;
						if (collection && collection.collection.length > 0) {
							this.validateNumber = validateNumber;
							this.showConfirmationDialog(resources.localizableStrings.NumberExistsQurestion,
								validateNumber, ['yes', 'no']);
						} else {
							this.save(true);
						}
					}, this);
				}
			}
			return isValid;
		}

		function validateNumber(returnCode) {
			if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
				this.save(true);
			}
		}

		function pageSave(isValid) {
			if (!isValid) {
				isValid = pageValidate.call(this);
			}
			return isValid;
		}

		function RemindToOwnerDateOnChange() {
			var remindToOwner = this.get('RemindToOwner');
			if (Ext.isEmpty(remindToOwner)) {
				return;
			}
			if (remindToOwner) {
				var dateTime = this.getSysDefaultValue(Terrasoft.SystemValueType.CURRENT_DATE_TIME);
				dateTime.setDate(dateTime.getDate() + 1);
				this.set('RemindToOwnerDate', dateTime);
			} else {
				this.set('RemindToOwnerDate', null);
			}
		}

		function StatusFilter(esq) {
			var type = this.get('Type');
			if (!Ext.isEmpty(type)) {
				var filterName = 'StatusByTypeFilter';
				var leftExpression = '[DocumentTypeStatusEntry:DocumentStatus].DocumentType';
				return Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					leftExpression, type.value);
			}
			return null;
		}

		return {
			resources: resources,
			rightPanel: rightPanel,
			pageInit: pageInit,
			pageSave: pageSave,
			pageValidate: pageValidate,
			RemindToOwnerDateOnChange: RemindToOwnerDateOnChange,
			StatusFilter: StatusFilter,
			validateNumber: validateNumber,
			getParentRules: getParentRules
		};
	});