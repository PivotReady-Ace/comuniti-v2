interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function RatingStars({ rating, maxRating = 5, size = 'md', showValue = true }: RatingStarsProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const isFilled = index < Math.floor(rating);
    const isPartial = index === Math.floor(rating) && rating % 1 !== 0;
    
    return (
      <i
        key={index}
        className={`${
          isFilled ? 'fas fa-star' : isPartial ? 'fas fa-star-half-alt' : 'far fa-star'
        } text-comuniti-yellow ${sizeClasses[size]}`}
      />
    );
  });

  return (
    <div className="flex items-center">
      <div className="flex">{stars}</div>
      {showValue && (
        <span className={`text-gray-600 ml-1 ${sizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
