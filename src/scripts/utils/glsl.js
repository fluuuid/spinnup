import glslify from 'glslify';

export default function (file) {
    return glslify(require(`../../shaders/${file}`));
}
