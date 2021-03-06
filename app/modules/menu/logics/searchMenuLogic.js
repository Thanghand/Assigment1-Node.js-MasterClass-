
module.exports = SearchMenuLogic;

function SearchMenuLogic(menuRepository){
    this.menuRepository = menuRepository;
}

SearchMenuLogic.prototype.getAll = function(){
    return new  Promise(((resolve, reject) => {
        this.menuRepository.getAll('menu')
            .then(menuEntities => resolve(menuEntities), err => reject(err));
    }));
};