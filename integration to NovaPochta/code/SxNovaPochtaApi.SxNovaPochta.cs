namespace Terrasoft.Configuration.SxNovaPochtaApi
{
    using System;
    using System.IO;
    using System.Net;
    using System.Text;
    using System.Xml;
    using System.Xml.Linq;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;

    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class SxNovaPochtaApi
    {
        private const string URL_API = @"https://api.novaposhta.ua/v2.0/xml/";
        private const string KEY_API = @"d44e54bea9354393c50958aa2548e909";
        private const string SENDER_CONTRAGENT_API = @"Роззувайло";         //Аббасов       TODO
        private const string WAREHOUSE_SENDER = @"47402ea7-e1c2-11e3-8c4a-0050568002cf";    //TODO

        /// <summary>
        /// контрагент
        /// </summary>
        class Contragent
        {
            //город
            public string City;
            //ид контрагента
            public string Ref;
            //адресс
            public string Address;
            //контакт персон
            public string Contact;
            //телефон
            public string Phone;
        }

        /// <summary>
        /// Отпрака запроса на сервис НОвой Почты и получение результата
        /// </summary>
        /// <param name="xml">запрос</param>
        /// <returns>ответ</returns>
        private string SendRequestToNovaPochta(string xml)
        {
            StringBuilder stbReturn = new StringBuilder();
            StreamReader streamRead = null;
            WebResponse webResponse = null;

            Uri HttpSite = new Uri(URL_API);
            HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(HttpSite);
            webRequest.Method = "POST";
            webRequest.ContentType = "text/xml; encoding='utf-8'";
            byte[] Bytes = Encoding.UTF8.GetBytes(xml);
            webRequest.ContentLength = Bytes.Length;
            System.IO.Stream OutputStream = webRequest.GetRequestStream();
            OutputStream.Write(Bytes, 0, Bytes.Length);
            OutputStream.Close();
            try
            {
                webResponse = webRequest.GetResponse();
                streamRead = new StreamReader(webResponse.GetResponseStream());
                stbReturn.Append(streamRead.ReadToEnd());
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
            finally
            {
                if (streamRead != null) streamRead.Close();
                if (webResponse != null) webResponse.Close();
            }
            return stbReturn.ToString();
        }

        /// <summary>
        /// получение контрагента отправителя
        /// </summary>
        /// <returns>ответ</returns>
        private string GetSender()
        {
            XDocument doc = new XDocument(
                new XElement("file",
                    new XElement("apiKey", KEY_API),
                    new XElement("calledMethod", "getCounterparties"),
                    new XElement("methodProperties",
                        new XElement("CounterpartyProperty", "Sender"),
                        new XElement("FindByString", SENDER_CONTRAGENT_API)),
                    new XElement("modelName", "Counterparty")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return result;
        }

        /// <summary>
        /// получить аддрес контрагента
        /// </summary>
        /// <param name="sRef">ссылка на контрагента</param>
        /// <returns>ответ</returns>
        private string GetAddressSender(string sRef)
        {
            XDocument doc = new XDocument(
                new XElement("file",
                    new XElement("apiKey", KEY_API),
                    new XElement("calledMethod", "getCounterpartyAddresses"),
                    new XElement("methodProperties",
                        new XElement("CounterpartyProperty", "Sender"),
                        new XElement("Ref", sRef)),
                    new XElement("modelName", "Counterparty")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return this.GetRef(result);
        }

        /// <summary>
        /// получить ид города
        /// </summary>
        /// <param name="city">название города</param>
        /// <returns>реф города</returns>
        private string GetCityByString(string city)
        {
            XDocument doc = new XDocument(
                new XElement("file",
                    new XElement("apiKey", KEY_API),
                    new XElement("calledMethod", "getCities"),
                    new XElement("methodProperties",
                        new XElement("FindByString", city)),
                    new XElement("modelName", "Address")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return this.GetRef(result);
        }

        /// <summary>
        /// получить ид улицы
        /// </summary>
        /// <param name="city">название города</param>
        /// <param name="street">название улицы</param>
        /// <returns>реф улицы</returns>
        private string GetStreetByString(string city, string street)
        {
            XDocument doc = new XDocument(
                new XElement("file",
                    new XElement("apiKey", KEY_API),
                    new XElement("calledMethod", "getStreet"),
                    new XElement("methodProperties",
                        new XElement("CityRef", city),
                        new XElement("FindByString", street)),
                    new XElement("modelName", "Address")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return result;
        }

        /// <summary>
        /// получить рэф ответа
        /// </summary>
        /// <param name="responce">ответ</param>
        /// <returns>рэф</returns>
        private string GetRef(string responce)
        {
            XmlDocument sendersXML = new XmlDocument();
            sendersXML.LoadXml(responce);

            // проверяем успешность запроса
            bool success = bool.Parse(sendersXML.GetElementsByTagName("success")[0].InnerText);
            if (!success) return string.Empty;

            string resRef = sendersXML.GetElementsByTagName("Ref")[0].InnerText;
            return resRef;
        }

        /// <summary>
        /// создать адрес получателя
        /// </summary>
        /// <param name="build">дом</param>
        /// <param name="recRef">рэф контрагента получателя</param>
        /// <param name="street">улица</param>
        /// <returns>ид адреса</returns>
        private string CreateAddressRecipient(string build, string recRef, string street, string cityRef)
        {
            //string streetRef = this.GetStreetByString(cityRef, street);

            XDocument doc = new XDocument(
                    new XElement("file",
                        new XElement("apiKey", KEY_API),
                        new XElement("calledMethod", "save"),
                        new XElement("methodProperties",
                            new XElement("BuildingNumber", build),
                            new XElement("CounterpartyRef", recRef),
                            new XElement("StreetRef", street)),
                        new XElement("modelName", "Address")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return this.GetRef(result);

        }

        /// <summary>
        /// получить контакты
        /// </summary>
        /// <param name="refId">рэф контрагента</param>
        /// <returns></returns>
        private string GetContactPersons(string refId)
        {
            XDocument doc = new XDocument(
                    new XElement("file",
                        new XElement("apiKey", KEY_API),
                        new XElement("calledMethod", "getCounterpartyContactPersons"),
                        new XElement("methodProperties",
                            new XElement("Ref", refId)),
                        new XElement("modelName", "Counterparty")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return result;
        }

        /// <summary>
        /// получить рэф адресе новой почты
        /// </summary>
        private string GetWareHouse(string city, string warehouse)
        {
            XDocument doc = new XDocument(
                    new XElement("file",
                        new XElement("apiKey", KEY_API),
                        new XElement("calledMethod", "getWarehouses"),
                        new XElement("methodProperties",
                            new XElement("CityRef", city),
                            new XElement("FindByString", warehouse)),
                        new XElement("modelName", "Address")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return this.GetRef(result);
        }

        private string SaveRecipientAddres(string recipientRef, string streetRef, string build, string flat)
        {
            XDocument doc = new XDocument(
                    new XElement("file",
                        new XElement("apiKey", KEY_API),
                        new XElement("calledMethod", "save"),
                        new XElement("methodProperties",
                            new XElement("BuildingNumber", build),
                            new XElement("CounterpartyRef", recipientRef),
                             new XElement("Flat", flat),
                              new XElement("StreetRef", streetRef)),
                        new XElement("modelName", "Address")));

            string result = SendRequestToNovaPochta(doc.ToString());
            return result;
        }

        /// <summary>
        /// создать контрагента получателя
        /// </summary>
        /// <param name="cityRef">ид города</param>
        /// <param name="fName">фамилия</param>
        /// <param name="lName">имя</param>
        /// <param name="phone">телефон</param>
        /// <returns>рэф соданного контрагента</returns>
        private string CreateContragentRecipient(string cityRef, string fName, string lName, string phone)
        {
            XDocument doc = new XDocument(
                new XElement("file",
                    new XElement("apiKey", KEY_API),
                    new XElement("calledMethod", "save"),
                    new XElement("methodProperties",
                        new XElement("CityRef", cityRef),
                        new XElement("CounterpartyProperty", "Recipient"),
                        new XElement("CounterpartyType", "PrivatePerson"),
                        new XElement("FirstName", fName),
                        new XElement("LastName", lName),
                        new XElement("Phone", phone)),
                    new XElement("modelName", "Counterparty")));

            string result = SendRequestToNovaPochta(doc.ToString());

            return result;
        }

        /*private string GetPriceDeliveryOrderInNP(string cost, string weight, string citySender, string cityRecipient)
        {
            XDocument doc = new XDocument(
                new XElement("root",
                    new XElement("apiKey", KEY_API),
                    new XElement("modelName", "InternetDocument"),
                    new XElement("calledMethod", "getDocumentPrice"),
                    new XElement("methodProperties",
                         new XElement("Cost", cost),
                         new XElement("Weight", weight),
                         new XElement("CitySender", citySender),
                         new XElement("CityRecipient", cityRecipient)
                         )));

            string responce = SendRequestToNovaPochta(doc.ToString());

            XmlDocument result = new XmlDocument();
            result.LoadXml(responce);
            // проверяем успешность запроса
            bool success = bool.Parse(result.GetElementsByTagName("success")[0].InnerText);
            if (!success) return string.Empty;

            string status = result.GetElementsByTagName("Cost")[0].InnerText;
            return status;
        }*/

        ///создать ЕН с обратной досьавкой(деньги)
        private string CreateRequestWithRedelivery(Contragent sender, Contragent recipient, string paymentMethod, string date, string weight,
    string serviceType, string seatsAmount, string price)
        {
            XDocument doc = new XDocument(
              new XElement("root",
                  new XElement("apiKey", KEY_API),
                  new XElement("modelName", "InternetDocument"),
                  new XElement("calledMethod", "save"),
                  new XElement("methodProperties",
                      new XElement("BackwardDeliveryData",
						new XElement("item",
                          new XElement("CargoType", "Money"),
                          new XElement("PayerType", "Sender"),
                          new XElement("RedeliveryString", price))),
                      new XElement("PayerType", "Recipient"), //кто оплачивает доставку
                      new XElement("PaymentMethod", paymentMethod),
                      new XElement("DateTime", date),
                      new XElement("Weight", weight),
                      new XElement("CargoType", "Cargo"),
                      new XElement("Description", "парник"),
                      new XElement("ServiceType", serviceType),
                      new XElement("SeatsAmount", seatsAmount),
                      new XElement("Cost", price),
                      //данные отправителя
                      new XElement("CitySender", sender.City),
                      new XElement("Sender", sender.Ref),
                      new XElement("SenderAddress", sender.Address), // склад отправки
                      new XElement("ContactSender", sender.Contact),
                      new XElement("SendersPhone", sender.Phone),
                      //данные получателя
                      new XElement("CityRecipient", recipient.City),
                      new XElement("Recipient", recipient.Ref),
                      new XElement("RecipientAddress", recipient.Address),
                      new XElement("ContactRecipient", recipient.Contact),
                      new XElement("RecipientsPhone", recipient.Phone)
                      )));

            return doc.ToString();
        }

        ///Создать ЕН без обраной доставки
        private string CreateRequestWithOutRedelivery(Contragent sender, Contragent recipient, string paymentMethod, string date, string weight,
    string serviceType, string seatsAmount, string price)
        {
            XDocument doc = new XDocument(
              new XElement("root",
                  new XElement("apiKey", KEY_API),
                  new XElement("modelName", "InternetDocument"),
                  new XElement("calledMethod", "save"),
                  new XElement("methodProperties",
                      new XElement("PayerType", "Recipient"), //кто оплачивает доставку
                      new XElement("PaymentMethod", paymentMethod),
                      new XElement("DateTime", date),
                      new XElement("Weight", weight),
                      new XElement("CargoType", "Cargo"),
                      new XElement("Description", "парник"),
                      new XElement("ServiceType", serviceType),
                      new XElement("SeatsAmount", seatsAmount),
                      new XElement("Cost", price),
                      //данные отправителя
                      new XElement("CitySender", sender.City),
                      new XElement("Sender", sender.Ref),
                      new XElement("SenderAddress", sender.Address), // склад отправки
                      new XElement("ContactSender", sender.Contact),
                      new XElement("SendersPhone", sender.Phone),
                      //данные получателя
                      new XElement("CityRecipient", recipient.City),
                      new XElement("Recipient", recipient.Ref),
                      new XElement("RecipientAddress", recipient.Address),
                      new XElement("ContactRecipient", recipient.Contact),
                      new XElement("RecipientsPhone", recipient.Phone)
                      )));

            return doc.ToString();
        }


        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
        ResponseFormat = WebMessageFormat.Json)]
        public string CreateOrderInNP(string fName, string lName, string city, string price, string date,
            string phoneR, string seatsAmount, string serviceType, string weight, string paymentMethod,
            string address, string isAddress, string isRedelivery, string streetD, string buildD, string flatD)
        {
            //1.получам контрагент отправителя

            var sender = new Contragent();
            string senderString = this.GetSender();
            //разбор ответа 
            XmlDocument xml = new XmlDocument();
            xml.LoadXml(senderString);
            // проверяем успешность запроса
            bool success = bool.Parse(xml.GetElementsByTagName("success")[0].InnerText);
            if (!success) return "Error. " + xml.GetElementsByTagName("item")[0].InnerText;
            //получаем ид контрагента
            sender.Ref = xml.GetElementsByTagName("Ref")[0].InnerText;
            //получаем ид города контрагента
            sender.City = xml.GetElementsByTagName("City")[0].InnerText;
            //получаем ид склада контрагента
            // string senderAddress = this.GetAddressSender(senderRef);
            sender.Address = WAREHOUSE_SENDER;
            //получаем контакт отправителя 
            string sStr = this.GetContactPersons(sender.Ref);
            xml.LoadXml(sStr);
            // проверяем успешность запроса
            success = bool.Parse(xml.GetElementsByTagName("success")[0].InnerText);
            if (!success) return "Error. " + xml.GetElementsByTagName("item")[0].InnerText;
            //получаем контакт
            sender.Contact = xml.GetElementsByTagName("Ref")[0].InnerText;
            //получаем  телефон контрагента отправителя
            sender.Phone = xml.GetElementsByTagName("Phones")[0].InnerText;

            //2. создаем получателя

            var recipient = new Contragent()
            {
                Phone = phoneR
            };
            //город получателя
            recipient.City = this.GetCityByString(city);
            //создаем контрагент получателя
            string recipienString = this.CreateContragentRecipient(recipient.City, fName, lName, phoneR);
            xml.LoadXml(recipienString);
            // проверяем успешность запроса
            success = bool.Parse(xml.GetElementsByTagName("success")[0].InnerText);
            if (!success) return "Error. " + xml.GetElementsByTagName("item")[0].InnerText;
            //ид получателя
            recipient.Ref = xml.GetElementsByTagName("Ref")[0].InnerText;
            //контактных персон получателя
            recipient.Contact = xml.GetElementsByTagName("Ref")[1].InnerText;
            //адрес 
            if (bool.Parse(isAddress))
            {
                //TODO get fields (parse)
                var streetRef = "";
                string streetString = this.GetStreetByString(recipient.City, streetD);
                //возвращает true даже если не нашло никакой улицы,
                //поэтому решили это сделать так!!
                try
                {
                    xml.LoadXml(streetString);
                    success = bool.Parse(xml.GetElementsByTagName("success")[0].InnerText);
                    if (!success) return "Error. Unable to find street!";
                    streetRef = xml.GetElementsByTagName("Ref")[0].InnerText;
                }
                catch
                {
                    return "Error. Unable to find street!";
                }

                var addressString = this.SaveRecipientAddres(recipient.Ref, streetRef, buildD, flatD);
                xml.LoadXml(addressString);
                success = bool.Parse(xml.GetElementsByTagName("success")[0].InnerText);
                if (!success) return "Error. " + xml.GetElementsByTagName("item")[0].InnerText;
                recipient.Address = xml.GetElementsByTagName("Ref")[0].InnerText;
            }
            else
                recipient.Address = this.GetWareHouse(recipient.City, address);

            //3. создаем ЕН

            var request = string.Empty;
            if (bool.Parse(isRedelivery))
                request = this.CreateRequestWithRedelivery(sender, recipient, paymentMethod, date, weight, serviceType, seatsAmount, price);
            else
                request = this.CreateRequestWithOutRedelivery(sender, recipient, paymentMethod, date, weight, serviceType, seatsAmount, price);

            string result = SendRequestToNovaPochta(request);
            return result;
        }

         [OperationContract]
         [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
         ResponseFormat = WebMessageFormat.Json)]
        public string GetStatusOrderInNP(string en)
        {
            XDocument doc = new XDocument(
                new XElement("root",
                    new XElement("apiKey", KEY_API),
                    new XElement("modelName", "InternetDocument"),
                    new XElement("calledMethod", "documentsTracking"),
                    new XElement("methodProperties",
                         new XElement("Documents",
                            new XElement("item", en)))));

            return SendRequestToNovaPochta(doc.ToString());
        }
		
		[OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.Wrapped,
         ResponseFormat = WebMessageFormat.Json)]
        public string DeleteENInOrder(string docRef)
        {
            XDocument doc = new XDocument(
                new XElement("root",
                    new XElement("apiKey", KEY_API),
                    new XElement("modelName", "InternetDocument"),
                    new XElement("calledMethod", "delete"),
                    new XElement("methodProperties",
                            new XElement("DocumentRefs", docRef))));

            var result = SendRequestToNovaPochta(doc.ToString());

            XmlDocument xml = new XmlDocument();
            xml.LoadXml(result);
            var success = xml.GetElementsByTagName("success")[0].InnerText;
            return success;
        }
    }
}
