const HashUtil = require('../../shared/utils/hashUtil');
const LoginRequest = require('../models/loginRequest');
const TokenEntity = require('../../../../shared/models/entities/tokenEntity');

module.exports = LoginLogic;

function LoginLogic(userRepository, tokenRepository){
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
}

LoginLogic.prototype.verifyAccount =  function (request) {

    const loginRequest = new LoginRequest(request);
    const hashPassword = HashUtil.hash(loginRequest.password);

    const query = { 'email' : loginRequest.email};

    return new Promise((resolve, reject) => {
        this.userRepository.getByQuery('user', query)
            .then(entities => {
                if (entities.length === 0)
                    reject(new Error('No account existed'));

                const entity = entities[0];
                if (hashPassword === entity.password)
                    return entity;
                else
                    reject(new Error(' Wrong email or password'));
            })
            .then(entity => {
                return new Promise((resolve, reject) => {
                    entity.isLogin = true;
                    this.userRepository.update('user', entity)
                        .then(userEntity => resolve(userEntity),
                                err => reject(err));
                });
            })
            .then(entity => {
                const tokenEntity = new TokenEntity(HashUtil.createRandomString(40), entity.email);
                return new Promise((resolve, reject) => {
                    this.tokenRepository.add('token', tokenEntity).then(tokenEntity => {
                        resolve({
                           tokenEntity: tokenEntity,
                           userInfo: entity
                       });
                    }, err => reject(err));
                });
            })
            .then(result => {
                const response = {
                    token: result.tokenEntity.id,
                    id: result.userInfo.id,
                    email: result.tokenEntity.email,
                    name: result.userInfo.username,
                    phone: result.userInfo.phone,
                    address: result.userInfo.address
                };

                resolve(response);
            }, err => reject(err));
    });
};




