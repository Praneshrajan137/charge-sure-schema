import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Car, AlertTriangle } from 'lucide-react';
import { useStations } from '@/hooks/useStations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UpdateStatusScreen = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { data: stations = [] } = useStations();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const station = stations.find(s => s.station_id === stationId);

  const updateChargerStatus = async (chargerId: string, status: string) => {
    setUpdating(chargerId);
    
    try {
      const { error } = await supabase
        .from('chargers')
        .update({
          current_status: status,
          last_update_timestamp: new Date().toISOString()
        })
        .eq('charger_id', chargerId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update charger status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status Updated",
        description: `Charger status updated to ${status}`,
      });

      // Navigate back after a short delay to show the toast
      setTimeout(() => {
        navigate(-1);
      }, 1000);

    } catch (error) {
      console.error('Error updating charger status:', error);
      toast({
        title: "Error",
        description: "Failed to update charger status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (!station) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Station not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Report Status</h1>
            <p className="text-sm text-muted-foreground">{station.name}</p>
          </div>
        </div>

        {/* Chargers List */}
        <div className="space-y-4">
          {station.chargers.map((charger) => (
            <Card key={charger.charger_id} className="p-4">
              <div className="mb-4">
                <h3 className="font-bold">
                  Charger {charger.charger_id} ({charger.plug_type})
                </h3>
                <p className="text-sm text-muted-foreground">
                  {charger.max_power_kw} kW · Current: {charger.current_status}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateChargerStatus(charger.charger_id, 'Available')}
                  disabled={updating === charger.charger_id}
                  className="flex items-center gap-2 border-ev-available text-ev-available hover:bg-ev-available hover:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Works Fine
                </Button>

                <Button
                  variant="outline"
                  onClick={() => updateChargerStatus(charger.charger_id, 'In Use')}
                  disabled={updating === charger.charger_id}
                  className="flex items-center gap-2 border-ev-in-use text-ev-in-use hover:bg-ev-in-use hover:text-white"
                >
                  <Car className="h-4 w-4" />
                  I'm Charging
                </Button>

                <Button
                  variant="outline"
                  onClick={() => updateChargerStatus(charger.charger_id, 'Out of Service')}
                  disabled={updating === charger.charger_id}
                  className="flex items-center gap-2 border-ev-out-of-service text-ev-out-of-service hover:bg-ev-out-of-service hover:text-white"
                >
                  <AlertTriangle className="h-4 w-4" />
                  It's Broken
                </Button>
              </div>

              {updating === charger.charger_id && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Updating status...
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusScreen;