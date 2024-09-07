export const geoData = {
  "type": "Topology",
  "objects": {
    "countries": {
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Polygon",
          "properties": { "name": "Afghanistan" },
          "id": "AFG",
          "arcs": [[0, 1, 2, 3, 4, 5]]
        },
        {
          "type": "MultiPolygon",
          "properties": { "name": "Angola" },
          "id": "AGO",
          "arcs": [[[6, 7, 8, 9]], [[10, 11, 12]]]
        },
        // ... Add more countries here
        {
          "type": "MultiPolygon",
          "properties": { "name": "United States of America" },
          "id": "USA",
          "arcs": [[[1588, 1589, 1590, 1591, -1549]], [[1592]], [[1593]], [[1594]], [[1595]], [[1596]], [[1597]], [[1598]]]
        },
        // ... Continue with other countries
      ]
    }
  },
  "arcs": [
    // ... Add the arcs data here
  ]
};