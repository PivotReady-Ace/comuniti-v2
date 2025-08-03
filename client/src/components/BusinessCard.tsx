import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RatingStars } from './RatingStars';
import type { Business } from '@shared/schema';

interface BusinessCardProps {
  business: Business & {
    rating?: number;
    recommendations?: number;
    description?: string;
  };
  mode?: 'preview' | 'full';
  onContact?: (business: Business) => void;
  onReview?: (business: Business) => void;
  onRemove?: (businessId: string) => void;
  showActions?: boolean;
}

export function BusinessCard({
  business,
  mode = 'full',
  onContact,
  onReview,
  onRemove,
  showActions = true,
}: BusinessCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Restaurant': 'comuniti-orange',
      'Healthcare': 'comuniti-cyan',
      'Legal Services': 'comuniti-blue',
      'Education': 'comuniti-teal',
      'Real Estate': 'comuniti-yellow',
      'Beauty & Wellness': 'comuniti-red',
      'Transportation': 'comuniti-blue',
    };
    return colors[category] || 'comuniti-blue';
  };

  if (mode === 'preview') {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{business.name}</h4>
              <p className="text-sm text-gray-600">{business.category}</p>
              {business.location && (
                <p className="text-sm text-gray-500 mt-1">{business.location}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onContact?.(business)}
                className="text-comuniti-teal hover:text-comuniti-cyan p-1"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </Button>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(business.id)}
                  className="text-gray-400 hover:text-comuniti-red p-1"
                >
                  <i className="fas fa-trash text-sm"></i>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-bold text-gray-900 mr-2">{business.name}</h3>
              {business.rating && <RatingStars rating={business.rating} size="sm" />}
            </div>
            <p className={`text-sm text-${getCategoryColor(business.category)} font-medium mb-1`}>
              {business.category}
            </p>
            {business.location && (
              <p className="text-gray-600 text-sm mb-2">{business.location}</p>
            )}
            {business.description && (
              <p className="text-gray-700 text-sm leading-relaxed">{business.description}</p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <i className="fas fa-thumbs-up mr-1"></i>
              <span>{business.recommendations || 0} recommendations</span>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => onContact?.(business)}
                className="flex items-center px-4 py-2 bg-comuniti-teal text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Contact
              </Button>
              <Button
                variant="outline"
                onClick={() => onReview?.(business)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-comment mr-2"></i>
                Review
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
