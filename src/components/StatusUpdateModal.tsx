import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Charger {
  charger_id: string;
  plug_type: string;
  max_power_kw: number;
  current_status: string;
  last_update_timestamp: string;
}

interface Station {
  station_id: string;
  name: string;
  address: string;
  chargers: Charger[];
}

interface StatusUpdateModalProps {
  station: Station | null;
  charger: Charger | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const statusOptions = [
  { value: 'Available', label: 'Available', icon: CheckCircle, color: 'bg-ev-available' },
  { value: 'In Use', label: 'In Use', icon: Clock, color: 'bg-ev-in-use' },
  { value: 'Out of Service', label: 'Out of Service', icon: AlertTriangle, color: 'bg-ev-out-of-service' },
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  station,
  charger,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!charger || !selectedStatus) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('update_charger_status', {
        p_charger_id: charger.charger_id,
        p_new_status: selectedStatus,
        p_reported_by: 'Anonymous User', // In a real app, this would be the authenticated user
        p_notes: notes || undefined,
      });

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Charger status updated to ${selectedStatus}`,
      });

      onStatusUpdate();
      onClose();
      setSelectedStatus('');
      setNotes('');
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!station || !charger) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Update Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Station Info */}
          <div className="bg-accent/50 rounded-lg p-3">
            <h3 className="font-semibold text-sm">{station.name}</h3>
            <p className="text-xs text-muted-foreground">{station.address}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {charger.plug_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {charger.max_power_kw}kW
              </Badge>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Current Status</label>
            <Badge variant="outline" className="mb-3">
              {charger.current_status}
            </Badge>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">New Status</label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                const isCurrentStatus = charger.current_status === option.value;
                
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-start h-12 ${isCurrentStatus ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedStatus(option.value)}
                    disabled={isCurrentStatus}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {option.label}
                    {isCurrentStatus && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Current
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Any additional details about the charger status..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!selectedStatus || isSubmitting || selectedStatus === charger.current_status}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;