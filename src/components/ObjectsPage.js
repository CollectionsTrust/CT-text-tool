import React from 'react';
import { useParams } from 'react-router-dom';
import ObjectsPageComponent from './ObjectsPage/index';

// This is a bridge file that imports the refactored ObjectsPage component
// It maintains backward compatibility while using the new components
const ObjectsPage = () => {
  const { projectId } = useParams();
  
  return <ObjectsPageComponent />;
};

export default ObjectsPage;
