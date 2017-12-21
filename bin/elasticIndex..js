var elasticIndex = {



mappings:{"mappings": {
    "archive": {
        "properties": {
            "annee":    { "type": "integer"  },
            "boite":     { "type": "text"  },
            "chemise":      { "type": "text" },
            "souschemise":      { "type": "text" },
            "source":      { "type": "text" },
            "titre":      { "type": "text" }
        }
    }
}





}
}

    module.exports = elasticIndex;