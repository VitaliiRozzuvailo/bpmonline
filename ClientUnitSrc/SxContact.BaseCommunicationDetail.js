define("BaseCommunicationDetail", ["BaseCommunicationDetailResources", "CtiConstants", "ConfigurationConstants",
    "ViewUtilities", "MultiMaskEdit"
], function(resources, CTIBaseConstants, ConfigurationConstants, ViewUtilities) {
    var emailTypeId = ConfigurationConstants.Communications.UseForAccounts.Other.Email.value;
    var currentItemConfigIndex = 0;
    function validateNumber(value) {
        var invalidMessage = "";
        var isValid = true;
        var communicationType = this.get("CommunicationType");
        var number = value || this.get("Number");
        if (ConfigurationConstants.PhonesCommunicationTypes.indexOf(communicationType.value) !== -1) {
            isValid = (Ext.isEmpty(number) ||
                new RegExp("^\\+7\\([0-9][0-9][0-9]\\)[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$").test(number)
                || new RegExp("^\\+380\\([0-9][0-9]\\)[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$").test(number)
                || new RegExp("^\\+375\\([0-9][0-9]\\)[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$").test(number)
                || new RegExp("^\\+48\\([0-9][0-9]\\)[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$").test(number)
                || new RegExp("^\\+9\\([0-9][0-9][0-9]\\)[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$").test(number));
            // || new RegExp("^\\+380\\([0-9][0-9]\\)[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$").test(number));
            if (!isValid) {
                invalidMessage = "Некорректный номер";
            }

        }
        return {
            invalidMessage: invalidMessage,
            isValid: isValid
        };
    }
    return {
        methods: {
            /**
             * получить только цифры из строки
             */
            getDigitsFromString: function(value) {
                return value.replace(/\D/g, "");
            },
            getMask: function(communicationType) {
                //debugger;
                if (this.isPhoneTypeForMask(communicationType)) {

                   if(CountryBase!='undefined' && CountryBase=='Казахстан'||CountryBase=='Россия'){
                      return {
                      formats: ["+7(999)999-99-99"]
                      };
                   }
                   if(CountryBase!='undefined' && CountryBase=='Украина'){
                       return {
                       formats: ["+380(99)999-99-99"]
                       };
                   }
                    if(CountryBase!='undefined' && CountryBase=='Беларусь'){
                        return {
                            formats: ["+375(99)999-99-99"]
                        };
                    }
                    if(CountryBase!='undefined' && CountryBase=='Польша'){
                        return {
                            formats: ["+48(99)999-99-99"]
                        };
                    }
                   else
                     {
                        return {
                        formats: ["+9(999)999-99-99"]
                        };
                     }
                }
                return [];
            },
            // исключает тип "Внутренний номер"
            isPhoneTypeForMask: function(communicationType) {
                communicationType = communicationType.value || communicationType;
                return ConfigurationConstants.PhonesCommunicationTypes.indexOf(communicationType) !== -1;
            },
            getMaskEditConfig: function(maskConfig) {
                var result = {
                    className: "Terrasoft.MultiMaskEdit",
                    mask: {
                        bindTo: "Masks"
                    },
                    onBeforePasteFormatValue: this.getDigitsFromString
                };
                if (maskConfig) {
                    result.maskConfig = maskConfig;
                }
                return result;
            },
            /**
             * @inheritdoc Terrasoft.BaseCommunicationDetail#getItemViewConfig
             * @overridden
             */
            getItemViewConfig: function(itemConfig, item) {
                this.callParent(arguments);
                this.set("itemViewConfig", null);
                var items = itemConfig.config.items;
                var textEditIndex = 1; //TODO: Добавить константу
                var testEdit = items[textEditIndex];
                Ext.apply(testEdit, this.getMaskEditConfig());
                //получаем маску по типу
                var communicationType = item.get("CommunicationType");
                item.set("Masks", this.getMask(communicationType));
            },
            initItem: function(detailModel) {
                this.set("PhoneCommunicationTypes", detailModel.get("PhoneCommunicationTypes"));
                detailModel.addColumnValidator("Number", validateNumber, this);
            },
            onItemChanged: function(item, config) {
                this.callParent(arguments);
                var communicationType = item.get("CommunicationType");
                item.set("Masks", this.getMask(communicationType));
            },
            addItem: function(tag) {
                var collection = this.get("Collection");
                var items = collection.getItems();
                var itemsLength = items.length;
                this.callParent(arguments);
                var newItemsLength = items.length;
                if (itemsLength === newItemsLength) {
                    return;
                }
                var itemViewModel = items[newItemsLength - 1];
                this.initItem.call(itemViewModel, this);
            },
            initItems: function() {
                if (this.get("IsDataLoaded")) {
                    var collection = this.get("Collection");
                    Terrasoft.each(collection.getItems(), function(item) {
                        this.initItem.call(item, this);
                    }, this);
                }
            },
            /**
             * Загружает средства связи
             * @protected
             * @virtual
             * @param {Function} callback callback-функция
             * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
             */
            loadContainerListData: function(callback, scope) {
                this.callParent([function() {
                    // Добавляем валидатор перед сохранением записи
                    this.initItems();
                    callback.call(scope);
                }, this]);
            }
            //TODO: добавить свою валидацию, регулярное выражение для валидации поля можно скопировать
            // из mask.re.full в MultiMaskEdit
        }
    };
});
