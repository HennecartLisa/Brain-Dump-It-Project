interface UiBasicPlaceholderProps {
  title: string;
  description: string;
  className?: string;
}

export default function UiBasicPlaceholder({ title, description, className = "" }: UiBasicPlaceholderProps) {
  return (
    <div className="col-span-4">
      <div className="row-span-2">
        <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
