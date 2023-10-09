import xmltodict


class Xml2Json():
    
    def __init__(
        self,
        xml_data: str,
        entity_name: str,
        property_atts: None
    ):

        """
        Takes the SBD entities schema metadata as XML and parse it to JSON.

        Args:
            xml_data (str): Full XML metadata SDB API response.
            entity_name (str): EntityType or name to be processed and output.
            property_atts (list): List of attributes as strings to return for each entity property.
        """

        # self.xml_path = xml_path
        self.xml_data = xml_data
        self.entity_name = entity_name
        self.parental_prop = ['edmx:Edmx','edmx:DataServices', 'Schema', 'EntityType']
        self.prop_attrs = property_atts if property_atts is not None else ['Name', 'Type', 'Nullable']
        self.entity_raw = self.get_entity
        self.entityJSON = self.entity_JSON

    # @property
    # def read_xml(self):
    #     with open(self.xml_path) as xml:
    #         return xml.read()

    @property
    def parsedJSON(self):
        """
        Parses full SDB API response into a JSON.

        Returns:
            JSON object: Full XML response parsed to JSON.
        """
        return xmltodict.parse(self.xml_data)


    @property
    def get_all_entities(self) -> list:
        
        all_entities = self.parsedJSON
        for parent in self.parental_prop:
            all_entities = all_entities.get(parent)

        return all_entities

    @property
    def get_entity(self) -> dict:
        
        all_entities = self.get_all_entities

        for idx in range(len(all_entities)):
            current_entity = all_entities[idx]
            current_name = current_entity.get('@Name')

            if current_name == self.entity_name:

                return current_entity
    
    def get_properties(self):
        """Append each self.prop_attrs for each entity property to a dictionary which is appended to a the entity_list list.

        Returns:
            list: List of all the attributes to be kept for each property within the entity in question.
        """
        
        entity_prop = []
        for property in self.entity_raw.get('Property')[:]:
            entity_prop.append({att:property[f'@{att}'] for att in self.prop_attrs})      
        
        return entity_prop
    
    @property
    def entity_JSON(self):
        """Recreated the finbal JSON structure.

        Returns:
            dict: Entity dictionary with its properties and attributes for each property.
        """
        return {
            'EntityName': self.entity_raw.get('@Name'),
            'Property': self.get_properties()
        }