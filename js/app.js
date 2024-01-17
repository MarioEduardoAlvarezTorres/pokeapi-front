$(document).ready(() => {
  const pokemonInput = $("#pokemonInput");
  const pokemonSelect = $("#pokemonSelect");

  const searchPokemon = async () => {
    const searchTerm = pokemonInput.val().trim().toLowerCase();

    if (searchTerm === "") {
      clearPokemonSelect();
      return;
    }

    try {
      const response = await $.get(
        `https://pokeapi.co/api/v2/pokemon?limit=1000`
      );
      const data = response.results;

      if (data) {
        displayPokemonOptions(data, searchTerm);
      } else {
        clearPokemonSelect();
      }
    } catch (error) {
      console.error("Error a consultar API", error);
    }
  };

  const displayPokemonOptions = (pokemonList, searchTerm) => {
    clearPokemonSelect();

    const defaultOption = $("<option>").val("").text("Selecciona un Pokémon");
    pokemonSelect.append(defaultOption);

    const filteredPokemon = pokemonList.filter(
      (pokemon) => pokemon.name.startsWith(searchTerm)
      //pokemon.name.includes(searchTerm) en el caso de que quier algo no tan especifico
    );

    $.each(filteredPokemon, (index, pokemon) => {
      const option = $("<option>").val(pokemon.name).text(pokemon.name);
      pokemonSelect.append(option);
    });
  };

  const clearPokemonSelect = () => {
    pokemonSelect.empty();
  };

  pokemonSelect.on("change", async () => {
    const selectedPokemonName = pokemonSelect.val();

    try {
      const response = await $.get(
        `https://pokeapi.co/api/v2/pokemon/${selectedPokemonName}`
      );

      const responseDescription = await $.get(
        `https://pokeapi.co/api/v2/pokemon-species/${selectedPokemonName}`
      );
      const data = response;
      const description = responseDescription;

      if (data) {
        const descriptionElement = document.querySelector(
          ".description-pokemon"
        );

        const heightElement = document.querySelector("#peso");
        const weightElement = document.querySelector("#altura");
        const nameElement = document.querySelector("#name-screen");

        nameElement.textContent = `Nombre: ${data.name}`;
        heightElement.textContent = `${data.height} M`;
        weightElement.textContent = `${data.weight} KG`;

        if (description.flavor_text_entries.length > 0) {
          const descriptionText = description.flavor_text_entries.find(
            (entry) => entry.language.name === "es"
          );

          if (descriptionText) {
            descriptionElement.textContent = descriptionText.flavor_text;
          } else {
            descriptionElement.textContent =
              "No hay descripción disponible en español.";
          }
        } else {
          descriptionElement.textContent =
            "No hay descripción disponible en español.";
        }
        sprites(data.sprites);
      } else {
        clearPokemonSelect();
      }
    } catch (error) {
      console.error("Erro a consultar API", error);
    }
  });

  pokemonInput.on("input", searchPokemon);

  // IMAGE
  const sprites = (pokemonImages) => {
    const pokemonImageElement = document.getElementById("pokemonImage");
    const imageKeys = Object.keys(pokemonImages);
    let index = 0;

    const changeImage = () => {
      const currentImageKey = imageKeys[index];
      const currentImageUrl = pokemonImages[currentImageKey];

      if (currentImageUrl !== null) {
        const img = new Image();
        img.onload = () => {
          pokemonImageElement.src = currentImageUrl;
          index = (index + 1) % imageKeys.length;
        };

        img.onerror = () => {
          console.log(`Error al cargar la imagen: ${currentImageUrl}`);
          index = (index + 1) % imageKeys.length;
        };

        img.src = currentImageUrl;
      } else {
        index = (index + 1) % imageKeys.length;
      }
    };

    pokemonImageElement.src = "";
    clearInterval(pokemonImageElement.intervalId);
    pokemonImageElement.intervalId = setInterval(changeImage, 200);
  };

  const descriptionElement = document.querySelector(".description-pokemon");

  descriptionElement.addEventListener("click", () => {
    const textToRead = descriptionElement.textContent;

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error(
        "La API de síntesis de voz no está soportada en este navegador."
      );
    }
  });

  descriptionElement.style.cursor = "pointer";
});
