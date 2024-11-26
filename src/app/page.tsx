"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [titulo, setTitulo] = useState('');
  const [porcao, setPorcao] = useState('');
  const [tipoRef, setTipoRef] = useState('Almoço');
  const [nivelDificuldade, setNivelDificuldade] = useState('Médio');
  const [ingredientes, setIngredientes] = useState('');
  const [etapas, setEtapas] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);

  const API_URL = 'https://673bc0c996b8dcd5f3f758a0.mockapi.io/receitas-api/receitas'; 

 
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(API_URL);
        setRecipes(response.data);
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
      }
    };
    fetchRecipes();
  }, []);

  
  const handleSelectRecipe = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    setSelectedRecipe(recipe);
  };


  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();

    const recipeData = {
      'titulo-receita': titulo,
      'tipo-refeicao': tipoRef,
      porcao: parseInt(porcao),
      'nivel-dificuldade': nivelDificuldade,
      'lista-ingredientes': ingredientes.split(',').map((item) => item.trim()),
      'etapas-preparacao': etapas.split(',').reduce((acc: Record<string, string>, etapa, index) => {
        acc[String(index + 1)] = etapa.trim();
        return acc;
      }, {}),
    };

    
    if (editingRecipe) {
      recipeData.id = editingRecipe.id;
    }

    if (editingRecipe) {
      try {
        const response = await axios.put(`${API_URL}/${editingRecipe.id}`, recipeData);
        setRecipes(
          recipes.map((r) => (r.id === editingRecipe.id ? response.data : r))
        );
        setEditingRecipe(null);
      } catch (error) {
        console.error('Erro ao atualizar receita:', error);
      }
    } else {
      try {
        const response = await axios.post(API_URL, recipeData);
        setRecipes([...recipes, response.data]);
      } catch (error) {
        console.error('Erro ao adicionar receita:', error);
      }
    }

    setTitulo('');
    setPorcao('');
    setTipoRef('Almoço');
    setNivelDificuldade('Médio');
    setIngredientes('');
    setEtapas('');
  };


  const handleDeleteRecipe = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRecipes(recipes.filter((recipe) => recipe.id !== id));
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };


  const handleEditRecipe = (recipe: any) => {
    setEditingRecipe(recipe);
    setTitulo(recipe['titulo-receita']);
    setPorcao(String(recipe.porcao));
    setTipoRef(recipe['tipo-refeicao']);
    setNivelDificuldade(recipe['nivel-dificuldade']);
    setIngredientes(recipe['lista-ingredientes'].join(', '));
    setEtapas(Object.values(recipe['etapas-preparacao']).join(', '));
    setSelectedRecipe(null);
  };

  return (
    <div>
      <h1>Receitas</h1>

      <form onSubmit={handleSaveRecipe}>
        <input
          type="text"
          placeholder="Título da Receita"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <input
          type="number"
          placeholder="Porção"
          value={porcao}
          onChange={(e) => setPorcao(e.target.value)}
        />
        <select value={tipoRef} onChange={(e) => setTipoRef(e.target.value)}>
          <option value="Almoço">Almoço</option>
          <option value="Café da Manhã">Café da Manhã</option>
          <option value="Jantar">Jantar</option>
          <option value="Sobremesa">Sobremesa</option>
        </select>
        <select
          value={nivelDificuldade}
          onChange={(e) => setNivelDificuldade(e.target.value)}
        >
          <option value="Fácil">Fácil</option>
          <option value="Médio">Médio</option>
          <option value="Difícil">Difícil</option>
        </select>
        <textarea
          placeholder="Ingredientes (separe por vírgula)"
          value={ingredientes}
          onChange={(e) => setIngredientes(e.target.value)}
        />
        <textarea
          placeholder="Etapas de Preparação (separe por vírgula)"
          value={etapas}
          onChange={(e) => setEtapas(e.target.value)}
        />
        <button type="submit">{editingRecipe ? 'Atualizar Receita' : 'Adicionar Receita'}</button>
      </form>

      
      <h2>Lista de Receitas</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <h3 onClick={() => handleSelectRecipe(recipe.id)}>{recipe['titulo-receita']}</h3>
            <button onClick={() => handleEditRecipe(recipe)}>Editar</button>
            <button onClick={() => handleDeleteRecipe(recipe.id)}>Excluir</button>
          </li>
        ))}
      </ul>

      
      {selectedRecipe && (
        <div>
          <h2>{selectedRecipe['titulo-receita']}</h2>
          <p><strong>Tipo de Refeição:</strong> {selectedRecipe['tipo-refeicao']}</p>
          <p><strong>Porção:</strong> {selectedRecipe.porcao}</p>
          <p><strong>Nível de Dificuldade:</strong> {selectedRecipe['nivel-dificuldade']}</p>
          <p><strong>Ingredientes:</strong></p>
          <ul>
            {selectedRecipe['lista-ingredientes'].map((ingredient: string, index: number) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <p><strong>Etapas de Preparação:</strong></p>
          <ol>
            {Object.entries(selectedRecipe['etapas-preparacao']).map(([key, step]: [string, string]) => (
              <li key={key}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Home;
