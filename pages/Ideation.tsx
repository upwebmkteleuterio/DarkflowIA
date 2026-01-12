
import React from 'react';
import { Project } from '../types';
import { useIdeation } from '../hooks/useIdeation';
import IdeationForm from '../components/Ideation/IdeationForm';
import TitleList from '../components/Ideation/TitleList';

interface IdeationProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Ideation: React.FC<IdeationProps> = ({ project, onUpdate, onNext }) => {
  const { 
    loading, 
    formData, 
    updateField, 
    handleGenerate, 
    selectTitle 
  } = useIdeation(project, onUpdate);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden pb-20">
      <IdeationForm 
        formData={formData} 
        updateField={updateField} 
        onGenerate={handleGenerate} 
        loading={loading} 
      />
      
      <TitleList 
        titles={project.titles} 
        loading={loading} 
        onSelect={(title) => selectTitle(title, onNext)} 
      />
    </div>
  );
};

export default Ideation;
