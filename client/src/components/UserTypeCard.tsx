import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserTypeCardProps {
  type: 'influencer' | 'business';
  title: string;
  description: string;
  features: string[];
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  buttonText: string;
  onClick: () => void;
}

export function UserTypeCard({
  type,
  title,
  description,
  features,
  icon,
  gradientFrom,
  gradientTo,
  buttonText,
  onClick,
}: UserTypeCardProps) {
  return (
    <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
      <CardContent className="p-8 text-center">
        <div className={`w-20 h-20 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <i className={`${icon} text-3xl text-white`}></i>
        </div>
        
        <h3 className="text-2xl font-bold text-comuniti-blue mb-4">{title}</h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        
        <ul className="text-sm text-gray-500 space-y-2 mb-8 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <i className="fas fa-check text-comuniti-teal mr-2"></i>
              {feature}
            </li>
          ))}
        </ul>
        
        <Button
          onClick={onClick}
          className={`w-full bg-gradient-to-r from-${gradientFrom} to-${gradientTo} text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all duration-300`}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
