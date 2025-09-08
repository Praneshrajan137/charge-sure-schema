import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Globe, Zap } from "lucide-react";

export const MapAlternatives = () => {
  const alternatives = [
    {
      name: "React Leaflet + OpenStreetMap",
      cost: "100% Free",
      pros: [
        "No usage limits or API keys required",
        "Excellent React integration",
        "Large community and ecosystem",
        "Lightweight and performant"
      ],
      cons: [
        "Basic styling compared to Mapbox",
        "Fewer advanced features out of the box"
      ],
      implementation: "✅ Currently implemented",
      tileOptions: [
        "OpenStreetMap Standard",
        "CartoDB Positron (Clean)",
        "Stamen Toner (High Contrast)"
      ]
    },
    {
      name: "Google Maps",
      cost: "Free Tier: 28,000 map loads/month",
      pros: [
        "Excellent satellite imagery",
        "Real-time traffic data",
        "Street View integration",
        "Familiar UI for users"
      ],
      cons: [
        "Requires API key and billing account",
        "Usage limits on free tier",
        "More expensive at scale"
      ],
      implementation: "Available as alternative",
      tileOptions: [
        "Roadmap", "Satellite", "Hybrid", "Terrain"
      ]
    },
    {
      name: "Maplibre GL JS",
      cost: "100% Free",
      pros: [
        "Fork of Mapbox GL JS (open source)",
        "Vector tiles support",
        "3D capabilities",
        "No vendor lock-in"
      ],
      cons: [
        "Requires vector tile hosting",
        "More complex setup",
        "Smaller ecosystem than Leaflet"
      ],
      implementation: "Can be integrated",
      tileOptions: [
        "OpenMapTiles", "Maptiler", "Custom vector tiles"
      ]
    },
    {
      name: "OpenLayers",
      cost: "100% Free",
      pros: [
        "Very powerful and feature-rich",
        "Supports many data formats",
        "Advanced mapping capabilities",
        "No dependencies"
      ],
      cons: [
        "Steeper learning curve",
        "Less React-friendly",
        "Larger bundle size"
      ],
      implementation: "Available as alternative",
      tileOptions: [
        "OSM", "Bing Maps", "ESRI", "Custom WMS"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Free Mapbox Alternatives</h2>
        <p className="text-muted-foreground">
          Compare different mapping solutions for your EV charging app
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {alternatives.map((alt, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {alt.name}
                    {alt.implementation === "✅ Currently implemented" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant={alt.cost.includes("Free") ? "default" : "secondary"}>
                      {alt.cost}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Pros
                  </h4>
                  <ul className="text-sm space-y-1">
                    {alt.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-orange-700 mb-2 flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Considerations
                  </h4>
                  <ul className="text-sm space-y-1">
                    {alt.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-blue-700 mb-2 flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Map Styles Available
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {alt.tileOptions.map((option, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Badge 
                    variant={alt.implementation.includes("Currently") ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {alt.implementation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Recommendation</h3>
          <p className="text-sm text-gray-700">
            For your EV charging app, <strong>React Leaflet with OpenStreetMap</strong> is the best choice because:
          </p>
          <ul className="text-sm mt-2 space-y-1 ml-4">
            <li>• Completely free with no usage limits</li>
            <li>• Perfect for location-based services</li>
            <li>• Easy to customize markers for charging stations</li>
            <li>• Great performance for mobile users</li>
            <li>• No vendor lock-in or API key management</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};